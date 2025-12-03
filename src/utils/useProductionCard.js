import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { fontBase64 } from './fonts/Roboto-Regular.js';
import logo from "../assets/Headwear_COLOR_CMYK_logo-1.png.webp";

export function useProductionCard() {

  const loadImage = (src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
    });
  };

  // ZMIANA: Funkcja przyjmuje teraz drugi argument: elementDoZdjecia
  const generateProductionCard = async (project, hatDomElement) => {
    const doc = new jsPDF();

    // 1. Fonty
    doc.addFileToVFS("Roboto-Regular.ttf", fontBase64);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");

    // 2. GENEROWANIE OBRAZKA Z DUŻEGO "GHOSTA"
    let hatImage = null;
    if (hatDomElement) {
      try {
        const canvas = await html2canvas(hatDomElement, {
          scale: 2, // 2x to aż nadto dla 800px źródła, będzie żyleta
          backgroundColor: null,
          logging: false
        });
        hatImage = canvas.toDataURL('image/png');
      } catch (e) {
        console.error("Błąd html2canvas:", e);
      }
    }

    // 3. UKŁAD STRONY
    
    // --- Lewa Strona: DANE TEKSTOWE ---
    doc.setFontSize(18);
    doc.text("KARTA PRODUKCYJNA", 14, 20);
    
    doc.setFontSize(10);
    doc.text(`ID: ${project.id}`, 14, 30);
    doc.text(`Data: ${project.createdAt}`, 14, 35); 
    doc.text(`Status: ${project.status}`, 14, 40);

    // --- Prawa Strona: DUŻA MINIATURKA (Wysoka jakość) ---
    if (hatImage) {
       // x=130, y=10, szer=70, wys=50 (Dostosuj proporcje do HatThumbnail)
       // Dzięki temu, że źródło ma 800px, tutaj skalujemy w dół = super jakość
       doc.addImage(hatImage, 'PNG', 130, 10, 70, 50);
    }

    // --- TABELA 1: KLIENT ---
    // Przesuwamy startY niżej, np. 65, żeby nie nachodziło na obrazek
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
    const specsData = [
      ['Gora - Kolor', conf.base?.top || '-'],
      ['Srodek - Kolor', conf.base?.middle || '-'],
      ['Dol - Kolor', conf.base?.bottom || '-'],
      ['Wzor Gora', conf.patterns?.top ? `ID: ${conf.patterns.top}` : 'BRAK'],
      ['Wzor Dol', conf.patterns?.bottom ? `ID: ${conf.patterns.bottom}` : 'BRAK'],
      ['Kolor Wzoru Gora', conf.pattern?.top || '-'],
      ['Kolor Wzoru Dol', conf.pattern?.main || '-'],
      ['Rozmiar czcionki', conf.text?.fontSize || '-'],
      ['Czcionki', conf.text?.font || '-'],
      ['Tekst', conf.text?.content || '-'],
      ['Kolor Tekstu', conf.text?.color || '-'],
      ['Y Tekstu', conf.text?.offsetY || '0'],
      ['Czy jest pompon', conf.pompons?.show ? 'TAK' : 'NIE']
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
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    
    // Logo na samym dole na środku (lub po prawej)
    if (logoImg) {
        const logoWidth = 50;
        const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
        
        // Pozycja X: (SzerokośćStrony - SzerokośćLogo) / 2 = Środek
        const x = (pageWidth - logoWidth) / 2;
        const y = pageHeight - logoHeight - 15;
        
        doc.addImage(logoImg, "PNG", x, y, logoWidth, logoHeight);
    }
    
    doc.setFontSize(8);

    doc.save(`Karta_Produkcyjna_${project.id}.pdf`);
  };

  return { generateProductionCard };
}