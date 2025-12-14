import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from "../assets/Headwear_COLOR_CMYK_logo-1.png.webp";
import { fontBase64 as RobotoBase64 } from './fonts/Roboto-Regular.js';

const imageCache = new Map();

export function useProductionCard() {

  const getPatternName = (id, patternsDict) => {
    if (!id) return 'BRAK';
    if (!patternsDict || !Array.isArray(patternsDict)) return `ID: ${id}`;
    const pattern = patternsDict.find(p => p.id == id);
    if (pattern) return pattern.name || pattern.nazwa || `ID: ${id}`;
    return `ID: ${id} (Nie znaleziono)`;
  };

  const loadImage = (src) => {
    if (imageCache.has(src)) return Promise.resolve(imageCache.get(src));
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      img.onload = () => {
        imageCache.set(src, img);
        resolve(img);
      };
      img.onerror = () => resolve(null);
    });
  };

  // 🎯 FUNKCJA ŁADOWANIA FONTU (dla Canvas API)
  const loadFontForCanvas = async (fontName) => {
    const fontFileName = getFontFileName(fontName);
    const fontUrl = `${window.location.origin}/fonts/${fontFileName}`;
    
    try {
      // Sprawdź czy już załadowany
      if (document.fonts.check(`16px "${fontName}"`)) {
        console.log(`✅ Font ${fontName} już załadowany`);
        return true;
      }

      console.log(`📥 Ładuję font: ${fontName} z ${fontFileName}`);
      const fontFace = new FontFace(fontName, `url(${fontUrl})`);
      await fontFace.load();
      document.fonts.add(fontFace);
      await document.fonts.ready;
      console.log(`✅ Font ${fontName} załadowany!`);
      return true;
    } catch (e) {
      console.error(`❌ Błąd ładowania fontu ${fontName}:`, e);
      return false;
    }
  };

  const getFontFileName = (fontName) => {
    if (!fontName) return 'arial.ttf';
    const lower = fontName.toLowerCase();
    
    const fontMap = {
      'arial': 'arial.ttf',
      'arialbold': 'arialbold.ttf',
      'gothic': 'msgothic.ttf',
      'calibri': 'calibri.ttf',
      'tahoma': 'tahoma.ttf',
      'impact': 'impact.ttf',
      'roboto': 'roboto.ttf'
    };

    for (const [key, file] of Object.entries(fontMap)) {
      if (lower.includes(key)) return file;
    }
    return 'arial.ttf';
  };

  // 🔥 GŁÓWNA FUNKCJA - SVG + Canvas Overlay
  const captureHatWithFont = async (hatElement, config) => {
    return new Promise(async (resolve, reject) => {
      try {
        // 1. Znajdź SVG w komponencie HatFlat
        const svgElement = hatElement.querySelector('svg');
        if (!svgElement) {
          reject(new Error('Brak SVG w elemencie czapki'));
          return;
        }

        // 2. Przygotuj Canvas
        const scale = 2; // Dla lepszej jakości
        const svgWidth = 1316.28;
        const svgHeight = 800.63;
        const canvas = document.createElement('canvas');
        canvas.width = svgWidth * scale;
        canvas.height = svgHeight * scale;
        const ctx = canvas.getContext('2d');

        // 3. Serializuj SVG (bez tekstu - bo go nadpiszemy)
        const svgClone = svgElement.cloneNode(true);
        
        // USUŃ tekst z SVG (żeby nie dublował się)
        const textElements = svgClone.querySelectorAll('text');
        textElements.forEach(el => el.remove());

        // 4. Konwertuj SVG do obrazu
        const svgData = new XMLSerializer().serializeToString(svgClone);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        const img = new Image();
        
        img.onload = async () => {
          // 5. Rysuj SVG czapki na canvas
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(svgUrl);

          // 6. NAŁÓŻ TEKST z właściwym fontem
          if (config.text?.content) {
            const fontName = config.text.font || 'Arial';
            
            // ZAŁADUJ FONT przed rysowaniem
            await loadFontForCanvas(fontName);
            
            const fontSize = (config.text.fontSize || 64) * scale;
            const textY = (395 - (config.text.offsetY || 0)) * scale; // 395 to FLAT_CENTER_Y z twojego komponentu
            
            ctx.font = `normal ${fontSize}px "${fontName}", sans-serif`;
            ctx.fillStyle = config.text.color || '#000000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Rysuj tekst na środku (658.14 to środek X z HatFlat)
            ctx.fillText(config.text.content, 658.14 * scale, textY);
          }

          // 7. Zwróć gotowy obraz
          resolve(canvas.toDataURL('image/png'));
        };

        img.onerror = () => {
          URL.revokeObjectURL(svgUrl);
          reject(new Error('Nie udało się załadować SVG'));
        };

        img.src = svgUrl;

      } catch (error) {
        reject(error);
      }
    });
  };

  // ============ GŁÓWNA FUNKCJA GENEROWANIA PDF ============
  const generateProductionCard = async (project, hatDomElement, patternsDict) => {
    console.log("🚀 Start generowania PDF...");
    const doc = new jsPDF();

    // Font bazowy PDF (Roboto dla tabel)
    const cleanRoboto = RobotoBase64.includes(',') ? RobotoBase64.split(',')[1] : RobotoBase64;
    doc.addFileToVFS("Roboto-Regular.ttf", cleanRoboto);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");

    // 🎯 WIZUALIZACJA - SVG czapki + Canvas tekst
    let hatImage = null;
    if (hatDomElement) {
      try {
        console.log("📸 Generuję wizualizację czapki...");
        hatImage = await captureHatWithFont(hatDomElement, project.config);
        console.log("✅ Wizualizacja gotowa!");
      } catch (e) {
        console.error("❌ Błąd wizualizacji:", e);
        alert("Wystąpił błąd podczas generowania czapki. PDF zostanie wygenerowany bez wizualizacji.");
      }
    }

    // --- RESZTA PDF ---
    doc.setFontSize(18);
    doc.text("KARTA PRODUKCYJNA", 14, 20);
    doc.setFontSize(10);
    doc.text(`ID: ${project.id}`, 14, 30);
    doc.text(`Data: ${project.createdAt}`, 14, 35); 
    doc.text(`Status: ${project.status}`, 14, 40);

    // Dodaj wizualizację czapki
    if (hatImage) {
      doc.addImage(hatImage, 'PNG', 130, 10, 70, 42); // Proporcje z HatFlat (1316:800 ≈ 1.65:1)
    }

    // Tabela 1 - Dane klienta
    autoTable(doc, {
        startY: 65, 
        styles: { font: "Roboto", fontStyle: "normal" },
        head: [['Klient', 'Firma', 'Kontakt']],
        body: [[
          project.client.name,
          project.client.company || '-',
          `${project.client.email}\n${project.client.phone || ''}`,
        ]],
        theme: 'grid',
        headStyles: { fillColor: [31, 41, 55] }
    });

    // Tabela 2 - Specyfikacja czapki
    const conf = project.config;
    let fontSizeDisplay = conf.text?.fontSize ? (conf.text.fontSize / 8).toFixed(1) + ' px' : '-';
    let YPos = conf.text?.offsetY !== undefined ? (conf.text.offsetY / 6).toFixed(1) + ' px' : '0 px';

    const specsData = [
      ['Góra - Kolor', conf.base?.top || '-'],
      ['Środek - Kolor', conf.base?.middle || '-'],
      ['Dół - Kolor', conf.base?.bottom || '-'],
      ['Wzór Góra', getPatternName(conf.patterns?.top, patternsDict)],
      ['Wzór Dół', getPatternName(conf.patterns?.bottom, patternsDict)],
      ['Kolor Wzoru Góra', conf.pattern?.top || '-'],
      ['Kolor Wzoru Dół', conf.pattern?.main || '-'],
      ['Rozmiar czcionki', fontSizeDisplay],
      ['Czcionka', conf.text?.font || '-'],
      ['Tekst', conf.text?.content || '-'],
      ['Kolor Tekstu', conf.text?.color || '-'],
      ['Y Tekstu', YPos],
      ['Pompon', conf.pompons?.show ? 'TAK' : 'NIE']
    ];

    if (conf.pompons?.show) {
        specsData.push(['Kolory Pompona', `1: ${conf.pompons.p1}, 2: ${conf.pompons.p2}, 3: ${conf.pompons.p3}, 4: ${conf.pompons.p4}`]);
    }

    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        styles: { font: "Roboto", fontStyle: "normal" },
        head: [['Element', 'Specyfikacja / Kolor (HEX)']],
        body: specsData,
        theme: 'striped',
        headStyles: { fillColor: [100, 100, 100] }
    });

    // Uwagi klienta
    if (project.order.notes) {
        let finalY = doc.lastAutoTable.finalY + 10;
        if (finalY > 270) { doc.addPage(); finalY = 20; }
        doc.setFontSize(10);
        doc.text("Uwagi do zamówienia:", 14, finalY);
        doc.setFontSize(9);
        const splitNotes = doc.splitTextToSize(project.order.notes, 180);
        doc.text(splitNotes, 14, finalY + 5);
    }

    // Logo Headwear
    const logoImg = await loadImage(logo);
    if (logoImg) {
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        const logoWidth = 40;
        const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
        const x = (pageWidth - logoWidth) / 2;
        const y = pageHeight - logoHeight - 15;
        doc.addImage(logoImg, "PNG", x, y, logoWidth, logoHeight);
    }
    
    doc.save(`Karta_${project.id.slice(0, 8)}.pdf`);
    console.log("✅ PDF wygenerowany!");
  };

  return { generateProductionCard };
}