// src/composables/usePdfGenerator.js
import { nextTick } from 'vue';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export function usePdfGenerator() {
  
  /**
   * Konwertuje obraz na base64 (do załadowania tła)
   */
  const loadImageAsBase64 = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // Ważne dla CORS
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const generatePdf = async () => {
    console.log("🎨 Start generowania PDF z tłem...");
    
    await nextTick();

    const element1 = document.getElementById('print-flat-container');
    const element2 = document.getElementById('print-front-container');

    if (!element1 || !element2) {
      alert("Błąd: Nie znaleziono elementów do wydruku.");
      return false;
    }

    try {
      // Opcje dla html2canvas
      const options = {
        scale: 3,
        useCORS: true,
        backgroundColor: null, // ← TRANSPARENT (żeby nie miało białego tła)
        logging: false
      };

      // Równoległe generowanie
      console.log("📸 Renderowanie czapek...");
      const [canvas1, canvas2, bgImage] = await Promise.all([
        html2canvas(element1, options),
        html2canvas(element2, options),
        loadImageAsBase64('/src/assets/headwearbg.jpg') // ← Ścieżka do Twojego tła
      ]);

      const imgData1 = canvas1.toDataURL('image/png');
      const imgData2 = canvas2.toDataURL('image/png');

      // Tworzymy PDF A4 landscape (842 x 595 pt)
      const doc = new jsPDF('l', 'pt', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth(); // 842
      const pageHeight = doc.internal.pageSize.getHeight(); // 595

      console.log("🖼️ Dodawanie tła...");
      // 1. DODAJ TŁO (jako pierwszy layer)
      doc.addImage(bgImage, 'JPEG', 0, 0, pageWidth, pageHeight);

      // 2. OBLICZ POZYCJE CZAPEK
      const margin = 40;
      const availableWidth = pageWidth - (margin * 3);
      const boxWidth = availableWidth / 2;
      
      // Proporcje czapek
      const ratio1 = canvas1.height / canvas1.width;
      const ratio2 = canvas2.height / canvas2.width;
      
      const boxHeight1 = boxWidth * ratio1;
      const boxHeight2 = boxWidth * ratio2;
      
      // Wyśrodkowanie w pionie
      const maxHeight = Math.max(boxHeight1, boxHeight2);
      const yPos = (pageHeight - maxHeight) / 2;

      console.log("👒 Dodawanie czapek...");
      // 3. DODAJ CZAPKI (jako drugi layer, na tło)
      doc.addImage(imgData1, 'PNG', margin, yPos, boxWidth, boxHeight1);
      doc.addImage(imgData2, 'PNG', margin + boxWidth + margin, yPos, boxWidth, boxHeight2);

      // 4. DODAJ LOGO (opcjonalne)
      // Jeśli masz logo jako base64 lub ścieżkę, możesz dodać:
      // const logo = await loadImageAsBase64('/src/assets/Headwear_COLOR_CMYK_logo-1.png.webp');
      // doc.addImage(logo, 'PNG', 50, 30, 120, 40);

      // 5. DODAJ TEKST (stopka)
      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55); // Ciemny szary
      doc.text("WIZUALIZACJA #M38 - H", margin, pageHeight - 30);
      
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128); // Jasnoszary
      const date = new Date().toLocaleDateString('pl-PL');
      doc.text(`Data: ${date}`, pageWidth - margin - 100, pageHeight - 30);

      console.log("💾 Zapisywanie PDF...");
      doc.save(`HEADWEAR-Wizualizacja-${Date.now()}.pdf`);

      return true;
    } catch (err) {
      console.error("❌ Błąd PDF:", err);
      alert("Wystąpił błąd podczas generowania pliku PDF.");
      return false;
    }
  };

  return {
    generatePdf
  };
}