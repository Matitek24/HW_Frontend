import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fontBase64 as RobotoBase64 } from './fonts/Roboto-Regular.js'; 
import { ensureFontLoaded } from './fonts/fontLoader.js'; 
import { inlineStyles } from './inlineStyles.js';   
import { embedCurrentFont } from './embedFont.js';
import { exportSvgToImage } from './exportSvg.js'; 
import { useLanguage } from '../locales/useLanguage.js'; // Dodany import tłumaczeń

// --- KONFIGURACJA KOLORYSTYCZNA (Ciemny Grafit) ---
const THEME_COLOR = [44, 62, 80]; 
const SECONDARY_TEXT = [100, 116, 139];

// --- MAPA DOSTROJENIA CZCIONEK (Musi być identyczna jak w HatFlat.vue) ---
const FONT_TUNING = {
 'impact': { shift: 4, pivot: -0.01},
    'roboto': { shift: 4, pivot: 0.0},
    'arialbold': { shift: 6, pivot: -0.06},
    'arial': { shift: 2, pivot: 0.02},
    'tahoma': { shift: 5, pivot: -0.05},
    'default': { shift: 8, pivot: -0.05},
};
const captureFlatHat = async (flatComponentRef, config) => {
  return new Promise(async (resolve) => {
    try {
      const svgElement = flatComponentRef.svgRef; 
      if (!svgElement) return resolve(null);

      // 1. ZGODNOŚĆ BAZY (Taka sama jak w HatFlat.vue)
      const FLAT_BASE_Y = 395; 

      if (config.text?.font) {
        await ensureFontLoaded(config.text.font);
      }

      const viewBox = svgElement.viewBox.baseVal;
      const vW = viewBox.width || 1316.28;
      const vH = viewBox.height || 800.63;
      const aspectRatio = vW / vH;
      const scale = 1; // ZMNIEJSZAMY SKALĘ Z 2 NA 1
      const canvas = document.createElement('canvas');
      canvas.width = vW * scale;
      canvas.height = vH * scale;
      const ctx = canvas.getContext('2d');

      const svgClone = svgElement.cloneNode(true);
      svgClone.querySelectorAll('text').forEach(el => el.remove());
      const styledSvg = inlineStyles(svgClone, false);

      const svgData = new XMLSerializer().serializeToString(styledSvg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        // BARDZO WAŻNE: Wypełniamy tło na biało przed rysowaniem (dla formatu JPEG)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);

        if (config.text?.content) {
          const fontNameRaw = config.text.font || 'Arial';
          const fontName = fontNameRaw.toLowerCase();
          
          const userFontSize = config.text.fontSize || 64;
          const userOffset = -(config.text.offsetY || 0); 
          
          const tuning = FONT_TUNING[fontName] || FONT_TUNING['default'];

          const finalYWithoutScale = FLAT_BASE_Y + tuning.shift + (userOffset * 0.85) + (userFontSize * tuning.pivot);
          
          const textY = finalYWithoutScale * scale;
          const textX = (vW / 2) * scale;
          const fontSizeForCanvas = userFontSize * scale; 

          const fontWeight = ['arialbold', 'tahoma'].includes(fontName) ? 'bold' : 'normal';

          ctx.font = `${fontWeight} ${fontSizeForCanvas}px "${fontNameRaw}"`;
          ctx.fillStyle = config.text.color || '#000000';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'alphabetic';
          
          const isEdge = /Edg/.test(navigator.userAgent);
          const multiplier = isEdge ? 0.4 : 0.4;
          const compensatedY = textY + (fontSizeForCanvas * multiplier);
          
          ctx.fillText(config.text.content, textX, compensatedY);
        }
        
        resolve({ 
            // ZMIENIAMY NA JPEG Z KOMPRESJĄ 80%
            dataUrl: canvas.toDataURL('image/jpeg', 0.8), 
            ratio: aspectRatio
        });
      };
      img.src = url;
    } catch (e) {
      console.error("Flat error:", e);
      resolve(null);
    }
  });
};

const captureFrontHat = async (frontComponentRef, config, showPompon) => {
  try {
    const svgEl = frontComponentRef.svgRef;
    const pomponElRef = frontComponentRef.pomponRef;
    if (!svgEl) return null;

    const vb = svgEl.viewBox.baseVal;
    const ratio = (vb.width || 565) / (vb.height || 552);

    const fontName = config.text.font;
    await ensureFontLoaded(fontName);

    const styledSvg = inlineStyles(svgEl, true);
    styledSvg.querySelectorAll('text').forEach(t => {
      t.style.stroke = 'none';
      t.style.webkitFontSmoothing = 'antialiased'; 
      t.style.textRendering = 'optimizeLegibility';
    });
    
    styledSvg.style.shapeRendering = 'auto';
    const frozenSvg = embedCurrentFont(styledSvg, fontName);

    let readyPompon = null;
    if (showPompon && pomponElRef) {
       const rawSvg = pomponElRef.tagName === 'svg' ? pomponElRef : pomponElRef.querySelector('svg');
       if (rawSvg) readyPompon = inlineStyles(rawSvg, true);
    }

    const dataUrl = await exportSvgToImage(frozenSvg, {
      type: 'image/png', 
      scale: 1.3,        
      filename: null,
      pomponEl: readyPompon
    });

    return { dataUrl, ratio };

  } catch (e) {
    console.error("3D error:", e);
    return null;
  }
};

export function useGeneratorWizualizacji() {
  const { t } = useLanguage(); // Pobieranie funkcji t()

  const generatePDF = async (project, flatRef, frontRef) => {
  
    const doc = new jsPDF();

    // ========== SETUP FONTU ==========
    const cleanRoboto = RobotoBase64.includes(',') ? RobotoBase64.split(',')[1] : RobotoBase64;
    doc.addFileToVFS("Roboto-Regular.ttf", cleanRoboto);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.addFont("Roboto-Regular.ttf", "Roboto", "bold");
    doc.setFont("Roboto");

    // Nagłówek Grafitowy
    doc.setFillColor(...THEME_COLOR);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    
    doc.setFontSize(22);
    doc.setFont("Roboto", "bold");
    doc.text(t('pdf.title'), 105, 15, { align: 'center' }); // Tłumaczenie tytułu
    
    doc.setFontSize(9);
    doc.setFont("Roboto", "normal");
    // Tłumaczenie etykiet ID i Daty
    const idLabel = t('common.labels.id');
    const dateLabel = t('common.labels.date');
    doc.text(`${idLabel}: ${project.id || t('pdf.none')}  |  ${dateLabel}: ${project.createdAt || new Date().toLocaleDateString()}`, 105, 23, { align: 'center' });
    
    doc.setFontSize(7.5);
    doc.setTextColor(200, 200, 200);
    doc.text(t('pdf.disclaimer_colors'), 105, 34, { align: 'center', style: 'italic' }); // Tłumaczenie disclaimer'a

    const config = project.config; 
    const isPompon = config.pompons?.show;

    const [resFlat, res3D] = await Promise.all([
      flatRef ? captureFlatHat(flatRef, config) : null,
      frontRef ? captureFrontHat(frontRef, config, isPompon) : null
    ]);
    
    const startY = 60;
    doc.setTextColor(0, 0, 0);
    
    // Wizualizacje (Wyśrodkowane w blokach)
    if (resFlat && resFlat.dataUrl) {
      const width = 85;
      const height = width / resFlat.ratio; 
      // Centrowanie w lewym bloku (x: 15 do 105)
      doc.addImage(resFlat.dataUrl, 'PNG', 15, startY + 38, width, height);
    }

    if (res3D && res3D.dataUrl) {
      const width = 80;
      // Centrowanie w prawym bloku
      doc.addImage(res3D.dataUrl, 'PNG', 115, startY, width, 0);
    }

    // ========== TABELA PARAMETRÓW (ZMNIEJSZONA) ==========
    const tableY = 180;
    
    autoTable(doc, {
      startY: tableY,
      head: [[t('pdf.param_name'), t('pdf.param_value')]], // Tłumaczenie nagłówków tabeli
      body: [
        [t('configurator.options.hat_top'), config.base.top || '-'],
        [t('configurator.options.hat_middle'), config.base.middle || '-'],
        [t('admin.production_card.bottom_color'), config.base.bottom || '-'],
        [t('admin.production_card.text'), config.text.content || t('pdf.none')],
        [t('configurator.options.font'), config.text.font || 'Arial'],
      ],
      styles: { 
        font: "Roboto",
        fontSize: 9, 
        cellPadding: 3, 
      },
      headStyles: {
        fillColor: THEME_COLOR,
        textColor: 255,
        fontStyle: 'bold',
        halign: 'left'
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      },
      margin: { left: 15, right: 15 }
    });

    // ========== NOWA LEKKA NOTKA POD TABELKĄ ==========
    const finalY = doc.lastAutoTable.finalY + 12;
    
    // Tło notki
    doc.setFillColor(248, 250, 252);
    doc.rect(15, finalY, 180, 22, 'F');
    
    // Border-left (Grafitowy pasek)
    doc.setFillColor(...THEME_COLOR);
    doc.rect(15, finalY, 1.2, 22, 'F');

    doc.setFontSize(8.5);
    doc.setTextColor(...THEME_COLOR);
    doc.setFont("Roboto", "bold");
    doc.text(t('pdf.info_title'), 20, finalY + 7); // Tłumaczenie tytułu sekcji Info

    doc.setFont("Roboto", "normal");
    doc.setTextColor(50, 50, 50);
    // Tłumaczenie opisu
    const disclaimer = `${t('modals.info.production_desc_1')} ${t('modals.info.production_desc_2')}`;
    const splitNote = doc.splitTextToSize(disclaimer, 170);
    doc.text(splitNote, 20, finalY + 13);

    // ========== STOPKA ==========
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(245, 245, 245);
    doc.rect(0, pageHeight - 15, 210, 15, 'F');
    
    doc.setFontSize(7.5);
    doc.setTextColor(150, 150, 150);
    // Tłumaczenie stopki
    doc.text(t('pdf.footer_auto'), 105, pageHeight - 9, { align: 'center' });
    doc.text(`© ${new Date().getFullYear()} - ${t('pdf.footer_copy')}`, 105, pageHeight - 5, { align: 'center' });

    doc.save(`Zamowienie_${project.id || t('pdf.none')}.pdf`);
  };

  return { generatePDF };
}