import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fontBase64 as RobotoBase64 } from './fonts/Roboto-Regular.js'; 
import { ensureFontLoaded } from './fonts/fontLoader.js'; 
import { inlineStyles } from './inlineStyles.js';   
import { embedCurrentFont } from './embedFont.js';
import { exportSvgToImage } from './exportSvg.js'; 

// --- KONFIGURACJA KOLORYSTYCZNA (Ciemny Grafit) ---
const THEME_COLOR = [44, 62, 80]; 

// --- MAPA DOSTROJENIA CZCIONEK ---
const FONT_TUNING = {
    'impact': { shift: 4, pivot: -0.01},
    'roboto': { shift: 4, pivot: 0.0},
    'arialbold': { shift: 6, pivot: -0.06},
    'arial': { shift: 2, pivot: 0.02},
    'tahoma': { shift: 5, pivot: -0.05},
    'default': { shift: 8, pivot: -0.05},
};

// --- HELPER: Bezpieczne pobieranie logotypu do Base64 ---
// Omija problemy z CORS i wygasłymi Blobami podczas serializacji SVG
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

const captureFlatHat = async (flatComponentRef, config) => {
  return new Promise(async (resolve) => {
    try {
      const svgElement = flatComponentRef.svgRef; 
      if (!svgElement) return resolve(null);

      const FLAT_BASE_Y = 395; 

      if (config.text?.font) {
        await ensureFontLoaded(config.text.font);
      }

      const viewBox = svgElement.viewBox.baseVal;
      const vW = viewBox.width || 1316.28;
      const vH = viewBox.height || 800.63;
      const aspectRatio = vW / vH;
      const scale = 1; 
      
      const canvas = document.createElement('canvas');
      canvas.width = vW * scale;
      canvas.height = vH * scale;
      const ctx = canvas.getContext('2d');

      const svgClone = svgElement.cloneNode(true);
      // Usuwamy natywne teksty i logotyp z klona (narysujemy je ręcznie w wyższej jakości)
      svgClone.querySelectorAll('text').forEach(el => el.remove());
      svgClone.querySelectorAll('.logo-image-exclude').forEach(el => el.remove());
      
      const styledSvg = inlineStyles(svgClone, false);
      const svgData = new XMLSerializer().serializeToString(styledSvg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = async () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);

        // ==========================================
        // 1. RĘCZNE RYSOWANIE LOGA + EFEKT HAFTU
        // ==========================================
        if (config.logo && config.logo.url) {
          await new Promise((resolveLogo) => {
            const logoImg = new Image();
            logoImg.crossOrigin = "anonymous";
            logoImg.onload = () => {
              // Baza pozycjonowania
              const x = (658 + (config.logo.x || 0)) * scale;
              const y = (620 + (config.logo.y || 0)) * scale;
              const logoScale = config.logo.scale || 1;
              
              // Max rozmiar boxa to 150px (pomnożone przez ewentualny zoom i skalę canvasa)
              const maxSize = 150 * scale * logoScale; 

              // --- RĘCZNE WYLICZANIE PROPORCJI (Aspect Ratio) ---
              let drawWidth = maxSize;
              let drawHeight = maxSize;

              if (logoImg.width > logoImg.height) {
                // Obrazek jest podłużny (np. napis Batman) -> zmniejszamy wysokość
                drawHeight = maxSize * (logoImg.height / logoImg.width);
              } else {
                // Obrazek jest pionowy (np. tarcza Lecha) -> zmniejszamy szerokość
                drawWidth = maxSize * (logoImg.width / logoImg.height);
              }

              // Obliczamy nowy lewy górny róg, żeby obrazek nadal był na środku wyznaczonego punktu
              const drawX = x - drawWidth / 2;
              const drawY = y - drawHeight / 2;
              
              ctx.save();
              
              // Maska (żeby logo ładnie chowało się pod wywinięciem, jeśli zjedzie za nisko)
              ctx.beginPath();
              ctx.rect(0.58 * scale, 512.74 * scale, 1313.78 * scale, 227.89 * scale);
              ctx.clip();

              // Rysowanie loga z nowymi, prawidłowymi wymiarami
              ctx.drawImage(logoImg, drawX, drawY, drawWidth, drawHeight);

              ctx.restore();
              resolveLogo();
            };
            logoImg.onerror = () => resolveLogo();
            logoImg.src = config.logo.url;
          });
        }

        // ==========================================
        // 2. RĘCZNE RYSOWANIE TEKSTU
        // ==========================================
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
    
    // Optymalizacja tekstu
    styledSvg.querySelectorAll('text').forEach(t => {
      t.style.stroke = 'none';
      t.style.webkitFontSmoothing = 'antialiased'; 
      t.style.textRendering = 'optimizeLegibility';
    });
    styledSvg.style.shapeRendering = 'auto';

    // Osadzanie czcionek
    const frozenSvg = embedCurrentFont(styledSvg, fontName);

    // ==========================================
    // MAGIA DLA WERSJI 3D: Podmiana loga z Bloba na Base64
    // ==========================================
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
    doc.text("WIZUALIZACJA CZAPKI M38", 105, 15, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont("Roboto", "normal");
    doc.text(`ID PROJEKTU: ${project.id || 'Niezapisany'}  |  DATA: ${project.createdAt || new Date().toLocaleDateString()}`, 105, 23, { align: 'center' });
    
    doc.setFontSize(7.5);
    doc.setTextColor(200, 200, 200);
    doc.text("* Kolory mogą się różnić przez wyświetlanie na monitorach - jest to tylko wizualizacja", 105, 34, { align: 'center', style: 'italic' });

    const config = project.config; 
    const isPompon = config.pompons?.show;

    const [resFlat, res3D] = await Promise.all([
      flatRef ? captureFlatHat(flatRef, config) : null,
      frontRef ? captureFrontHat(frontRef, config, isPompon) : null
    ]);
    
    const startY = 60;
    doc.setTextColor(0, 0, 0);
    
    if (resFlat && resFlat.dataUrl) {
      const width = 85;
      const height = width / resFlat.ratio; 
      doc.addImage(resFlat.dataUrl, 'JPEG', 15, startY + 38, width, height); // JPEG bo w captureFlatHat zmieniliśmy format!
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
    doc.text(`© ${new Date().getFullYear()} - System Headwear Configuration`, 105, pageHeight - 5, { align: 'center' });

    return doc.output('blob');
  };

  return { generatePDF };
}