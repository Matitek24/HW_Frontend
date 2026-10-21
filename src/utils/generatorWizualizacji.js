import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fontBase64 as RobotoBase64 } from './fonts/Roboto-Regular.js'; 
import { inlineStyles } from './inlineStyles.js';   
import { exportSvgToImage } from './exportSvg.js'; 

// NOWE IMPORTY:
import { captureFlatHat } from './captureFlatHat.js'; // Zmień ścieżkę jeśli trzeba
import { getFont } from './fonts/fontsStore.js';      // Zmień ścieżkę jeśli trzeba
import { embedFontFace } from './fonts/fontService.js'; // Zmień ścieżkę jeśli trzeba

const THEME_COLOR = [44, 62, 80]; 

const fetchImageToBase64 = async (url) => {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

// UWAGA: Funkcja captureFlatHat została stąd usunięta, 
// ponieważ importujemy jej ulepszoną, globalną wersję z pliku captureFlatHat.js!

const captureFrontHat = async (frontComponentRef, config, showPompon) => {
  try {
    const svgEl = frontComponentRef.svgRef;
    const pomponElRef = frontComponentRef.pomponRef;
    if (!svgEl) return null;

    const vb = svgEl.viewBox.baseVal;
    const ratio = (vb.width || 565) / (vb.height || 552);

    const styledSvg = inlineStyles(svgEl, true);
    
    styledSvg.querySelectorAll('text').forEach(t => {
      t.style.stroke = 'none';
      t.style.webkitFontSmoothing = 'antialiased'; 
      t.style.textRendering = 'optimizeLegibility';
    });
    styledSvg.style.shapeRendering = 'auto';

    // MAGIA DYNAMICZNYCH FONTÓW: Wstrzykujemy Base64 z naszego serwisu fontów!
    const fontObj = getFont(config.text?.font);
    const frozenSvg = await embedFontFace(styledSvg, fontObj);

    // Podmiana loga z Bloba na Base64
    if (config.logo && config.logo.url) {
      const logoB64 = await fetchImageToBase64(config.logo.url);
      frozenSvg.querySelectorAll('.logo-image-exclude').forEach(img => {
        if (logoB64) {
          img.setAttribute('href', logoB64);
          img.setAttribute('xlink:href', logoB64);
        } else {
          img.remove(); 
        }
      });
    }

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
  const generatePDF = async (project, flatRef, frontRef) => {
    const doc = new jsPDF();

    const cleanRoboto = RobotoBase64.includes(',') ? RobotoBase64.split(',')[1] : RobotoBase64;
    doc.addFileToVFS("Roboto-Regular.ttf", cleanRoboto);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.addFont("Roboto-Regular.ttf", "Roboto", "bold");
    doc.setFont("Roboto");

    doc.setFillColor(...THEME_COLOR);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    
    doc.setFontSize(22);
    doc.setFont("Roboto", "bold");
    doc.text("WIZUALIZACJA CZAPKI M38", 105, 15, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont("Roboto", "normal");
    doc.text(`ID PROJEKTU: ${project.id || 'Niezapisany'}  |  DATA: ${project.createdAt || new Date().toLocaleDateString()}`, 105, 23, { align: 'center' });
    
    doc.setFontSize(7.5);
    doc.setTextColor(200, 200, 200);
    doc.text("* Kolory mogą się różnić przez wyświetlanie na monitorach - jest to tylko wizualizacja", 105, 34, { align: 'center', style: 'italic' });

    const config = project.config; 
    const isPompon = config.pompons?.show;

    // Pobieramy obrazki (z użyciem naszej nowej funkcji globalnej dla Flat)
    const [resFlat, res3D] = await Promise.all([
      flatRef ? captureFlatHat(flatRef.svgRef, config, { scale: 1 }) : null,
      frontRef ? captureFrontHat(frontRef, config, isPompon) : null
    ]);
    
    const startY = 60;
    doc.setTextColor(0, 0, 0);
    
    if (resFlat && resFlat.dataUrl) {
      const width = 85;
      const height = width / resFlat.ratio; 
      doc.addImage(resFlat.dataUrl, 'JPEG', 15, startY + 38, width, height); 
    }

    if (res3D && res3D.dataUrl) {
      const width = 80;
      doc.addImage(res3D.dataUrl, 'PNG', 115, startY, width, 0);
    }

    // ========== TABELA PARAMETRÓW ==========
    const tableY = 180;
    
    autoTable(doc, {
      startY: tableY,
      head: [['PARAMETR PRODUKTU', 'WYBRANA WARTOŚĆ']],
      body: [
        ['Góra (Top)', config.base.top || '-'],
        ['Środek (Middle)', config.base.middle || '-'],
        ['Dół (Bottom)', config.base.bottom || '-'],
        ['Własny Logotyp', config.logo?.url ? `TAK (${config.logo.originalName || 'wgrano plik'})` : 'Brak'],
        ['Tekst / Napis', config.text.content || 'Brak'],
        ['Czcionka', config.text.font || 'Arial'],
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

    const finalY = doc.lastAutoTable.finalY + 12;
    
    doc.setFillColor(248, 250, 252);
    doc.rect(15, finalY, 180, 22, 'F');
    doc.setFillColor(...THEME_COLOR);
    doc.rect(15, finalY, 1.2, 22, 'F');

    doc.setFontSize(8.5);
    doc.setTextColor(...THEME_COLOR);
    doc.setFont("Roboto", "bold");
    doc.text("INFORMACJA:", 20, finalY + 7);

    doc.setFont("Roboto", "normal");
    doc.setTextColor(50, 50, 50);
    const disclaimer = "Wizualizacja ma charakter poglądowy. Ostateczna akceptacja odbywa się na podstawie przesłanego programu dziewiarskiego. W przypadku braku wybranego koloru przędzy, handlowiec zaproponuje najbliższy zamiennik.";
    const splitNote = doc.splitTextToSize(disclaimer, 170);
    doc.text(splitNote, 20, finalY + 13);

    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(245, 245, 245);
    doc.rect(0, pageHeight - 15, 210, 15, 'F');
    
    doc.setFontSize(7.5);
    doc.setTextColor(150, 150, 150);
    doc.text("Wygenerowano automatycznie przez system Headwear Professionals Configuration", 105, pageHeight - 9, { align: 'center' });
    doc.text(`© ${new Date().getFullYear()} System Headwear Configuration`, 105, pageHeight - 5, { align: 'center' });

    return doc.output('blob');
  };

  return { generatePDF };
}