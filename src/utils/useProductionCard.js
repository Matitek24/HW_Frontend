import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from "../assets/Headwear_COLOR_CMYK_logo-1.png.webp";
import { fontBase64 as RobotoBase64 } from './fonts/Roboto-Regular.js';
import { captureFlatHat } from './captureFlatHat.js';

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

  // Główna metoda generująca kartę
  const generateProductionCard = async (project, hatDomElement, patternsDict) => {
    const doc = new jsPDF();

    const cleanRoboto = RobotoBase64.includes(',') ? RobotoBase64.split(',')[1] : RobotoBase64;
    doc.addFileToVFS("Roboto-Regular.ttf", cleanRoboto);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");

    let hatImage = null;
    
    // MAGIA: Używamy tego samego captureFlatHat co w wizualizacji!
    if (hatDomElement) {
      try {
        // hatDomElement to u Ciebie '<div class="pdf-ghost-inner"><HatFlat /></div>'
        // więc musimy wyciągnąć z niego element SVG
        const svgElement = hatDomElement.querySelector('svg');
        if (svgElement) {
            // Generujemy z opcją formatu PNG, tak jak używał tego jsPDF w karcie produkcyjnej
            const result = await captureFlatHat(svgElement, project.config, { scale: 2, format: 'png' });
            if (result) {
                hatImage = result.dataUrl;
            }
        } else {
            console.error("Nie znaleziono tagu SVG w hatDomElement");
        }
      } catch (e) {
        console.error("Błąd generowania obrazka do karty produkcyjnej:", e);
      }
    }

    doc.setFontSize(18);
    doc.text("KARTA PRODUKCYJNA", 14, 20);
    doc.setFontSize(10);
    doc.text(`ID: ${project.id}`, 14, 30);
    doc.text(`Data: ${project.createdAt}`, 14, 35);
    doc.text(`Status: ${project.status}`, 14, 40);

    if (hatImage) {
      doc.addImage(hatImage, 'PNG', 130, 10, 70, 42); 
    }

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

    if (project.order.notes) {
      let finalY = doc.lastAutoTable.finalY + 10;
      if (finalY > 270) { doc.addPage(); finalY = 20; }
      doc.setFontSize(10);
      doc.text("Uwagi do zamówienia:", 14, finalY);
      doc.setFontSize(9);
      const splitNotes = doc.splitTextToSize(project.order.notes, 180);
      doc.text(splitNotes, 14, finalY + 5);
    }

  
    doc.save(`Karta_${project.id.slice(0, 8)}.pdf`);
  };

  return { generateProductionCard };
}