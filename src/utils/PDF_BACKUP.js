

import { nextTick } from 'vue';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export function usePdfGenerator() {
  
  const loadImageAsBase64 = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
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
    console.log("🎨 Start generowania PDF...");
    
    await nextTick();
    await document.fonts.ready;
    const element1 = document.getElementById('print-flat-container');
    const element2 = document.getElementById('print-front-container');
    

    if (!element1 || !element2) {
      alert("Błąd: Nie znaleziono elementów do wydruku.");
      return false;
    }

    try {
      // Funkcja czyszcząca style w wirtualnej kopii (clone)
      // To tutaj dzieje się magia usuwania tła i naprawiania wymiarów
      const prepareClone = (clonedDoc, elementId) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
            // 1. Usuwamy style kontenera (cienie, tła, radiusy)
            clonedElement.style.background = 'transparent';
            clonedElement.style.backgroundColor = 'rgba(0,0,0,0)';
            clonedElement.style.boxShadow = 'none';
            clonedElement.style.border = 'none';
            clonedElement.style.backdropFilter = 'none';
            
            clonedElement.style.width = 'auto'; 
            clonedElement.style.height = 'auto';
            clonedElement.style.position = 'static';
            
            // Jeśli wewnątrz są jakieś wrappery z klasą .svg-wrapper, też je czyścimy
            const wrappers = clonedElement.querySelectorAll('.svg-wrapper');
            wrappers.forEach(w => {
                w.style.background = 'transparent';
                w.style.boxShadow = 'none';
                w.style.border = 'none';
                w.style.width = '100%';
            });
        }
      };

      const options = {
        scale: 2,
        useCORS: true,
        backgroundColor: null, 
        logging: false
      };

      console.log("📸 Renderowanie czapek...");
      
      // Generujemy canvasy z użyciem onclone
      const [canvas1, canvas2, bgImage] = await Promise.all([
        html2canvas(element1, {
            ...options,
            onclone: (doc) => prepareClone(doc, 'print-flat-container')
        }),
        html2canvas(element2, {
            ...options,
            onclone: (doc) => prepareClone(doc, 'print-front-container')
        }),
        loadImageAsBase64('/src/assets/headwearbg2.jpg') 
      ]);

      const imgData1 = canvas1.toDataURL('image/png');
      const imgData2 = canvas2.toDataURL('image/png');

      // PDF Layout
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [2000, 1100]
      });
      const pageWidth = doc.internal.pageSize.getWidth(); 
      const pageHeight = doc.internal.pageSize.getHeight(); 

      console.log("🖼️ Dodawanie tła...");
      doc.addImage(bgImage, 'JPEG', 0, 0, 2000, 1100);

      const margin = 220;
      // Obliczamy dostępne miejsce
      const availableWidth = pageWidth - (margin * 3); // margines lewy, srodek, prawy
      const boxWidth = availableWidth / 2;
      
      const ratio1 = canvas1.height / canvas1.width;
      const ratio2 = canvas2.height / canvas2.width;
      
      const boxHeight1 = boxWidth * ratio1;
      const boxHeight2 = boxWidth * ratio2;
      
      // Centrowanie w pionie względem wyższego elementu
      const maxHeight = Math.max(boxHeight1, boxHeight2);
      const yPos = (pageHeight - maxHeight) / 2;

      // Wrzucamy obrazy czapek
      doc.addImage(imgData1, 'PNG', margin + 100, yPos - 150, boxWidth, boxHeight1);
      doc.addImage(imgData2, 'PNG', margin + 810, yPos, boxWidth, boxHeight2);

      // Stopka
      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55); 
      
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128); 



      doc.save(`HEADWEAR-Wizualizacja-${Date.now()}.pdf`);

      return true;
    } catch (err) {
     
      alert("Wystąpił błąd podczas generowania pliku PDF.");
      return false;
    }
  };

  return {
    generatePdf
  };
}