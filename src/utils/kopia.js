import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import domToImage from 'dom-to-image-more';
import logo from "../assets/Headwear_COLOR_CMYK_logo-1.png.webp";
// Import fontu bazowego dla PDF (nie dla wizualizacji)
import { fontBase64 as RobotoBase64 } from './fonts/Roboto-Regular.js';

// --- CACHE (Optymalizacja) ---
// Zapamiętujemy załadowane fonty, żeby nie męczyć sieci
const loadedFontsCache = new Set();
const imageCache = new Map();

export function useProductionCard() {

  // --- HELPERY ---

  const getFontFilename = (fontName) => {
    if (!fontName) return 'Roboto-Regular.ttf';
    const lower = fontName.toLowerCase();
    
    // Prosta mapa nazw
    const fontMap = {
      'arial': 'arial.ttf',
      'arialbold': 'arialbold.ttf',
      'gothic': 'msgothic.ttf',
      'calibri': 'calibri.ttf',
      'tahoma': 'tahoma.ttf',
      'impact': 'impact.ttf',
      'roboto': 'roboto.ttf'
    };

    // Szukamy dopasowania
    for (const [key, file] of Object.entries(fontMap)) {
      if (lower.includes(key)) return file;
    }
    return 'arial.ttf';
  };

  const getPatternName = (id, patternsDict) => {
    if (!id) return 'BRAK';
    if (!patternsDict || !Array.isArray(patternsDict)) return `ID: ${id}`;
    const pattern = patternsDict.find(p => p.id == id);
    return pattern ? (pattern.name || pattern.nazwa) : `ID: ${id}`;
  };

  const preloadFont = async (fontName, filename) => {
    // Jeśli już załadowaliśmy ten font w tej sesji, nie rób nic
    if (loadedFontsCache.has(filename)) return `${window.location.origin}/fonts/${filename}`;

    const fontUrl = `${window.location.origin}/fonts/${filename}`;
    try {
      const fontFace = new FontFace(fontName, `url(${fontUrl})`);
      await fontFace.load();
      document.fonts.add(fontFace);
      
      // Czekamy aż przeglądarka faktycznie "przetrawi" fonty
      await document.fonts.ready;
      
      loadedFontsCache.add(filename);
      return fontUrl;
    } catch (e) {
      console.error(`Błąd fontu ${filename}:`, e);
      return null;
    }
  };

  const loadImage = (src) => {
    if (imageCache.has(src)) return Promise.resolve(imageCache.get(src));

    return new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imageCache.set(src, img);
        resolve(img);
      };
      img.onerror = () => resolve(null);
    });
  };

  // --- GŁÓWNA FUNKCJA ---
  const generateProductionCard = async (project, hatDomElement, patternsDict) => {
    const doc = new jsPDF();

    // 1. Konfiguracja Fontu PDF (Roboto dla tekstów w PDF)
    const cleanRoboto = RobotoBase64.includes(',') ? RobotoBase64.split(',')[1] : RobotoBase64;
    doc.addFileToVFS("Roboto-Regular.ttf", cleanRoboto);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");

    // 2. Generowanie obrazka czapki (Snapshot)
    let hatImage = null;
    let injectedStyle = null;

    if (hatDomElement) {
      try {
        const userFontName = project.config?.text?.font || 'Roboto';
        const filename = getFontFilename(userFontName);
        const fontUrl = await preloadFont('SnapshotFont', filename);

        if (fontUrl) {
          // Wstrzykujemy styl bezpośrednio do elementu przed zdjęciem
          injectedStyle = document.createElement('style');
          injectedStyle.innerHTML = `
            @font-face {
                font-family: 'SnapshotFont';
                src: url('${fontUrl}') format('truetype');
            }
            * { font-family: 'SnapshotFont', sans-serif !important; }
          `;
          hatDomElement.appendChild(injectedStyle);
          
          // Kluczowe: czekamy chwilę na layout i render fontu
          await document.fonts.ready;
          await new Promise(r => setTimeout(r, 100)); 
        }

        const scale = 2; // Wyższa jakość
        const dataUrl = await domToImage.toPng(hatDomElement, {
          width: hatDomElement.offsetWidth * scale,
          height: hatDomElement.offsetHeight * scale,
          style: {
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: `${hatDomElement.offsetWidth}px`,
            height: `${hatDomElement.offsetHeight}px`
          },
          // Cache busting czasem pomaga, ale tutaj używamy lokalnych fontów
          cacheBust: false 
        });
        
        hatImage = dataUrl;

      } catch (e) {
        console.error("Błąd generowania wizualizacji:", e);
      } finally {
        if (injectedStyle && hatDomElement.contains(injectedStyle)) {
          hatDomElement.removeChild(injectedStyle);
        }
      }
    }

    // --- BUDOWANIE PDF ---
    
    // Nagłówek
    doc.setFontSize(18);
    doc.text("KARTA PRODUKCYJNA", 14, 20);
    
    doc.setFontSize(10);
    doc.text(`ID: ${project.id}`, 14, 30);
    doc.text(`Data: ${project.createdAt}`, 14, 35); 
    doc.text(`Status: ${project.status}`, 14, 40);

    // Obrazek czapki po prawej
    if (hatImage) {
      doc.addImage(hatImage, 'PNG', 130, 10, 70, 50);
    }

    // Tabela 1: Klient
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

    // Przygotowanie danych specyfikacji
    const conf = project.config;
    const fontSizeDisplay = conf.text?.fontSize ? (conf.text.fontSize / 8).toFixed(1) + ' px' : '-';
    const YPos = conf.text?.offsetY !== undefined ? (conf.text.offsetY / 6).toFixed(1) + ' px' : '0 px';

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

    // Tabela 2: Specyfikacja (Dynamiczny startY!)
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10, // Zawsze 10 jednostek pod poprzednią tabelą
      styles: { font: "Roboto", fontStyle: "normal" },
      head: [['Element', 'Specyfikacja / Kolor (HEX)']],
      body: specsData,
      theme: 'striped',
      headStyles: { fillColor: [100, 100, 100] }
    });

    // Uwagi
    if (project.order.notes) {
      let notesY = doc.lastAutoTable.finalY + 15;
      
      // Sprawdzenie czy zmieścimy się na stronie (A4 ma ~297mm wysokości)
      if (notesY > 270) { 
        doc.addPage(); 
        notesY = 20; 
      }
      
      doc.setFontSize(10);
      doc.setFont("Roboto", "bold");
      doc.text("Uwagi do zamówienia:", 14, notesY);
      
      doc.setFont("Roboto", "normal"); 
      doc.setFontSize(9);
      const splitNotes = doc.splitTextToSize(project.order.notes, 180);
      doc.text(splitNotes, 14, notesY + 5);
    }

    // Logo na dole strony
    const logoImg = await loadImage(logo);
    if (logoImg) {
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      const logoWidth = 40;
      const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
      
      doc.addImage(logoImg, "PNG", (pageWidth - logoWidth) / 2, pageHeight - logoHeight - 10, logoWidth, logoHeight);
    }
    
    doc.save(`Karta_${project.id.slice(0, 8)}.pdf`);
  };

  return { generateProductionCard };
}