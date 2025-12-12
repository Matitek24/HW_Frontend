import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { fontBase64 } from './fonts/Roboto-Regular.js';
import logo from "../assets/Headwear_COLOR_CMYK_logo-1.png.webp";

export function useProductionCard() {

  // Funkcja pomocnicza z logowaniem błędów
  const getPatternName = (id, patternsDict) => {
    if (!id) return 'BRAK';
    
    // Zabezpieczenie: jeśli słownik nie dotrze
    if (!patternsDict || !Array.isArray(patternsDict)) {
        console.warn(`Brak słownika wzorów dla ID: ${id}`);
        return `ID: ${id}`; 
    }
    
    // Szukamy wzoru (używamy == dla bezpieczeństwa typów string/number)
    const pattern = patternsDict.find(p => p.id == id);

    if (pattern) {
        // TU BYŁ BŁĄD: Sprawdzamy 'name' ORAZ 'nazwa' (zależnie od tego co zwraca API)
        return pattern.name || pattern.nazwa || `ID: ${id}`;
    }

    return `ID: ${id} (Nie znaleziono)`;
  };

  const loadImage = (src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
    });
  };

  const generateProductionCard = async (project, hatDomElement, patternsDict) => {
    // Debug: Zobacz co przychodzi w konsoli
    console.log("Generowanie PDF dla projektu:", project.id);
    console.log("Dostępne wzory:", patternsDict);

    const doc = new jsPDF();

    // 1. Fonty
    doc.addFileToVFS("Roboto-Regular.ttf", fontBase64);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");

    // 2. GENEROWANIE OBRAZKA Z "GHOSTA"
    let hatImage = null;
    if (hatDomElement) {
      try {
        const canvas = await html2canvas(hatDomElement, {
          scale: 2,
          backgroundColor: null,
          logging: false
        });
        hatImage = canvas.toDataURL('image/png');
      } catch (e) {
        console.error("Błąd html2canvas:", e);
      }
    }

    // 3. UKŁAD STRONY
    doc.setFontSize(18);
    doc.text("KARTA PRODUKCYJNA", 14, 20);
    
    doc.setFontSize(10);
    doc.text(`ID: ${project.id}`, 14, 30);
    doc.text(`Data: ${project.createdAt}`, 14, 35); 
    doc.text(`Status: ${project.status}`, 14, 40);

    if (hatImage) {
       doc.addImage(hatImage, 'PNG', 130, 10, 70, 50);
    }

    // --- TABELA 1: KLIENT ---
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

    // --- TABELA 2: SPECYFIKACJA ---
    const conf = project.config;

    // POPRAWKA: Obliczanie rozmiaru czcionki (zabezpieczenie przed NaNpx)
    let fontSizeDisplay = '-';
    if (conf.text?.fontSize) {
        // Dzielenie przez 8 daje mm (zgodnie z poprzednią rozmową: 160 / 8 = 20mm)
        fontSizeDisplay = (conf.text.fontSize / 8).toFixed(1) + ' px'; 
    }

    let YPos = '0 px';
    if(conf.text?.offsetY !== undefined) {
        // Tutaj też dzielimy przez 8, żeby zachować skalę milimetrów
        // Zmieniłem 'config' na 'conf' <- TO BYŁ GŁÓWNY BŁĄD
        YPos = (conf.text.offsetY / 6).toFixed(1) + ' px';
    }
    const specsData = [
      ['Góra - Kolor', conf.base?.top || '-'],
      ['Środek - Kolor', conf.base?.middle || '-'],
      ['Dół - Kolor', conf.base?.bottom || '-'],
      // Wywołanie z poprawioną funkcją getPatternName
      ['Wzór Góra', getPatternName(conf.patterns?.top, patternsDict)],
      ['Wzór Dół', getPatternName(conf.patterns?.bottom, patternsDict)],
      ['Kolor Wzoru Góra', conf.pattern?.top || '-'],
      ['Kolor Wzoru Dół', conf.pattern?.main || '-'],
      ['Rozmiar czcionki', fontSizeDisplay],
      ['Czcionka', conf.text?.font || '-'],
      ['Tekst', conf.text?.content || '-'],
      ['Kolor Tekstu', conf.text?.color || '-'],
      ['Y Tekstu', YPos || '0'],
      ['Pompon', conf.pompons?.show ? 'TAK' : 'NIE']
    ];

    if (conf.pompons?.show) {
        specsData.push([
            'Kolory Pompona', 
            `1: ${conf.pompons.p1}, 2: ${conf.pompons.p2}, 3: ${conf.pompons.p3}, 4: ${conf.pompons.p4}`
        ]);
    }

    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        styles: { font: "Roboto", fontStyle: "normal" },
        head: [['Element', 'Specyfikacja / Kolor (HEX)']],
        body: specsData,
        theme: 'striped',
        headStyles: { fillColor: [100, 100, 100] }
    });

    // --- UWAGI ---
    if (project.order.notes) {
        let finalY = doc.lastAutoTable.finalY + 10;
        if (finalY > 270) { doc.addPage(); finalY = 20; }
        
        doc.setFontSize(10);
        doc.text("Uwagi do zamówienia:", 14, finalY);
        doc.setFontSize(9);
        doc.setFont("Roboto", "normal"); 
        
        const splitNotes = doc.splitTextToSize(project.order.notes, 180);
        doc.text(splitNotes, 14, finalY + 5);
    }

    // --- STOPKA I LOGO ---
    const logoImg = await loadImage(logo);
    if (logoImg) {
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        const logoWidth = 50;
        const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
        const x = (pageWidth - logoWidth) / 2;
        const y = pageHeight - logoHeight - 15;
        doc.addImage(logoImg, "PNG", x, y, logoWidth, logoHeight);
    }
    
    doc.save(`Karta_Produkcyjna_${project.id}.pdf`);
  };

  return { generateProductionCard };
}