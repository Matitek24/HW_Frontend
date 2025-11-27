import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fontBase64 } from './fonts/Roboto-Regular.js';
import logo from "../assets/Headwear_COLOR_CMYK_logo-1.png.webp";



export function useProductionCard() {

  const generateProductionCard = (project) => {
    const doc = new jsPDF();
    const addLogo = (doc, callback) => {
        const img = new Image();
        img.src = logo;
        img.onload = () => {
          callback(img);
        };
      };
    // --- NAGŁÓWEK ---
    doc.addFileToVFS("Roboto-Regular.ttf", fontBase64);
    
    // 3. REJESTRUJEMY CZCIONKĘ
    // Drugi parametr to nazwa, której będziemy używać w kodzie (np. "Roboto")
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");

    // 4. USTAWIAMY JAKO DOMYŚLNĄ DLA TEKSTU (doc.text)
    doc.setFont("Roboto"); 

    // --- NAGŁÓWEK ---
    doc.setFontSize(18);
    // Teraz polskie znaki w doc.text zadziałają:
    doc.text("KARTA TECHNOLOGICZNA PRODUKCJI", 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`ID Zlecenia: ${project.id}`, 14, 30);
    // Data też często ma polskie znaki w nazwach miesięcy
    doc.text(`Data: ${project.createdAt}`, 14, 35); 
    doc.text(`Status: ${project.status}`, 14, 40);

    // --- TABELA 1: DANE ZAMAWIAJĄCEGO ---
    autoTable(doc, {
        startY: 45,
        // 5. WAŻNE: Musimy powiedzieć tabeli, żeby też używała tej czcionki!
        styles: {
          font: "Roboto", // Używamy nazwy zarejestrowanej w pkt 3
          fontStyle: "normal"
        },
        head: [['Klient', 'Firma', 'Kontakt']],
        body: [[
          project.client.name, // Tutaj mogą być polskie znaki (np. "Łukasz")
          project.client.company || '-',
          `${project.client.email}\n${project.client.phone || ''}`,
        ]],
        theme: 'grid',
        headStyles: { fillColor: [31, 41, 55] }
      });

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
      ['Y Tekstu', conf.text?.offsetY || '-'],
      ['Pompony', conf.pompons ? `1: ${conf.pompons.p1}, 2: ${conf.pompons.p2} 3: ${conf.pompons.p3} 4: ${conf.pompons.p4}` : 'BRAK']
    ];
    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        // Ponownie ustawiamy font dla tej tabeli
        styles: {
          font: "Roboto",
          fontStyle: "normal"
        },
        head: [['Element', 'Specyfikacja / Kolor (HEX)']],
        body: specsData,
        theme: 'striped',
        headStyles: { fillColor: [100, 100, 100] }
      });

    // --- UWAGI ---
    if (project.order.notes) {
        doc.text("Uwagi do zamówienia:", 14, doc.lastAutoTable.finalY + 10);
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        // Split text to fit width
        const splitNotes = doc.splitTextToSize(project.order.notes, 180);
        doc.text(splitNotes, 14, doc.lastAutoTable.finalY + 15);
    }

    // --- STOPKA ---
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.text("Headwear Professional", 105, pageHeight - 10, { align: 'center' });
    addLogo(doc, (img) => {
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
    
        const logoWidth = 40;
        const logoHeight = (img.height / img.width) * logoWidth;
    
        // pozycja na dole strony
        const x = (pageWidth - logoWidth) / 2;  // na środku
        const y = pageHeight - logoHeight - 20; // 20px nad krawędzią
    
        doc.addImage(img, "PNG", x, y, logoWidth, logoHeight);
    
        // po dodaniu obrazu — zapisz PDF
        doc.save(`Karta_Produkcyjna_${project.id}.pdf`);
    });
    

  };

  return { generateProductionCard };
}


