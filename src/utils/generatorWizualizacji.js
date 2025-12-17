import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fontBase64 as RobotoBase64 } from './fonts/Roboto-Regular.js'; 
import { ensureFontLoaded } from './fonts/fontLoader.js'; 
import { inlineStyles } from './inlineStyles.js';   
import { embedCurrentFont } from './embedFont.js';
import { exportSvgToImage } from './exportSvg.js'; 

const captureFlatHat = async (flatComponentRef, config) => {
  return new Promise(async (resolve) => {
    try {
      const svgElement = flatComponentRef.svgRef; 
      if (!svgElement) return resolve(null);

      if (config.text?.font) {
        await ensureFontLoaded(config.text.font);
      }

      const viewBox = svgElement.viewBox.baseVal;
      const vW = viewBox.width || 1316.28;
      const vH = viewBox.height || 800.63;
      
      const aspectRatio = vW / vH;

      const scale = 2; 
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
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);

        if (config.text?.content) {
          const fontName = config.text.font || 'Arial';
          const fontSize = (config.text.fontSize || 64) * scale;
          const fontWeight = ['tahoma', 'arialbold'].includes(fontName) ? 'bold' : 'normal';

          const textY = (395 - (config.text.offsetY || 0)) * scale; 
          const textX = (vW / 2) * scale;

          ctx.font = `${fontWeight} ${fontSize}px "${fontName}"`;
          ctx.fillStyle = config.text.color || '#000000';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          ctx.fillText(config.text.content, textX, textY);
        }
        
        resolve({ 
            dataUrl: canvas.toDataURL('image/png'),
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
    const frozenSvg = embedCurrentFont(styledSvg, fontName);

    let readyPompon = null;
    if (showPompon && pomponElRef) {
       const rawSvg = pomponElRef.tagName === 'svg' ? pomponElRef : pomponElRef.querySelector('svg');
       if (rawSvg) readyPompon = inlineStyles(rawSvg, true);
    }

    const dataUrl = await exportSvgToImage(frozenSvg, {
      type: 'image/png',
      scale: 3,
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

    // ========== SETUP FONTU ==========
    const cleanRoboto = RobotoBase64.includes(',') ? RobotoBase64.split(',')[1] : RobotoBase64;
    doc.addFileToVFS("Roboto-Regular.ttf", cleanRoboto);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.addFont("Roboto-Regular.ttf", "Roboto", "bold");
    doc.setFont("Roboto");

    // ========== NAGŁÓWEK Z TŁEM ==========
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, 210, 40, 'F');

    // Tytuł
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("WIZUALIZACJA CZAPKI", 105, 15, { align: 'center' });
    
    // Info
    doc.setFontSize(9);
    doc.text(`ID Projektu: ${project.id}  |  Data: ${project.createdAt}`, 105, 23, { align: 'center' });
    
    // Disclaimer
    doc.setFontSize(8);
    doc.text("* Kolory mogą się różnić przez wyświetlanie na monitorach - jest to tylko wizualizacja", 105, 35, { align: 'center', style: 'italic' });

    const config = project.config; 
    const isPompon = config.pompons?.show;

    // ========== GENEROWANIE OBRAZKÓW ==========
    const [resFlat, res3D] = await Promise.all([
      flatRef ? captureFlatHat(flatRef, config) : null,
      frontRef ? captureFrontHat(frontRef, config, isPompon) : null
    ]);

    // ========== SEKCJA Z OBRAZKAMI ==========
    const startY = 65;
    
    doc.setTextColor(0, 0, 0);
    
    // --- FLAT (Lewa strona) ---
    if (resFlat && resFlat.dataUrl) {
      doc.setFontSize(11);
      
      const width = 90;
      const height = width / resFlat.ratio; 
      
      doc.addImage(resFlat.dataUrl, 'PNG', 15, startY + 44 , width, height);
    }

    // --- 3D (Prawa strona) ---
    if (res3D && res3D.dataUrl) {
      doc.setFontSize(11);
      
      const width = 80;
      doc.addImage(res3D.dataUrl, 'PNG', 115, startY, width, 0);
    }

    // ========== TABELA PARAMETRÓW ==========
    const tableY = 190;
    
    doc.setFontSize(12);
    doc.setTextColor(41, 128, 185);

    doc.setTextColor(0, 0, 0);
    autoTable(doc, {
      startY: tableY,
      head: [['Parametr', 'Wartosc']],
      body: [
        ['Góra (Top)', config.base.top || '-'],
        ['Środek (Middle)', config.base.middle || '-'],
        ['Dół (Bottom)', config.base.bottom || '-'],
        ['Tekst', config.text.content || 'Brak'],
      ],
      styles: { 
        font: "Roboto",
        fontSize: 10,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });

    // ========== STOPKA ==========
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(240, 240, 240);
    doc.rect(0, pageHeight - 15, 210, 15, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("Wygenerowano automatycznie", 105, pageHeight - 8, { align: 'center' });
    doc.text(`© ${new Date().getFullYear()} - System Headwear`, 105, pageHeight - 4, { align: 'center' });

    doc.save(`Zamowienie_${project.id}.pdf`);
   
  };

  return { generatePDF };
}