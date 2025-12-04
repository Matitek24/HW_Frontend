import { nextTick } from 'vue';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import defaultLogo from "../assets/Headwear_COLOR_CMYK_logo-1.png.webp";

export function usePdfGenerator() {
  
  const loadImageAsBase64 = (url) => {
    return new Promise((resolve, reject) => {
      // Jeśli brak URL, zwracamy null natychmiast
      if (!url) {
          resolve(null);
          return;
      }

      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        // Zwracamy obiekt z danymi i wymiarami
        resolve({
            data: canvas.toDataURL('image/png'),
            width: img.width,
            height: img.height
        });
      };
      img.onerror = (e) => {
          console.warn("Błąd ładowania obrazka:", url);
          resolve(null); // Nie wysypujemy całego PDF przez brak logo
      };
      img.src = url;
    });
  };

  const generatePdf = async (config) => {
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
      // ⭐ NOWA funkcja - wymusza widok desktop niezależnie od rozmiaru ekranu
      const prepareClone = (clonedDoc, elementId) => {
        // 1. Najpierw dodajemy style nadpisujące media queries
        const style = clonedDoc.createElement('style');
        style.textContent = `
          /* Resetujemy WSZYSTKIE media queries */
          * {
            max-width: none !important;
            min-width: 0 !important;
          }
          
          /* Wymuszamy widok desktop dla kontenerów */
          #${elementId} {
            display: block !important;
            visibility: visible !important;
            width: auto !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            position: static !important;
            transform: none !important;
          }
          
          /* Czapka2 - resetujemy mobile styles */
          #${elementId} .czapka2 {
            width: auto !important;
            padding: 0 !important;
            padding-top: 0 !important;
            margin-top: 40px !important;
          }
          
          /* Pompon - resetujemy skalowanie mobile */
          #${elementId} .pompon {
            right: auto !important;
            transform: scale(1.33) !important;
            right: 68px !important;
            top: 12px !important;
            position: relative !important;
          }
          
          /* SVG wrapper */
          #${elementId} .svg-wrapper {
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          /* Wymuszamy wyświetlanie obu widoków */
          .flat-layout, .front-layout {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
          }
          
          .flat-layout {
            align-items: flex-end !important;
          }
          
          .front-layout {
            display: block !important;
          }
          
          /* Wyłączamy WSZYSTKIE media queries */
          @media (max-width: 600px) {
            #${elementId},
            #${elementId} .czapka2,
            #${elementId} .pompon {
              all: revert !important;
            }
          }
        `;
        clonedDoc.head.appendChild(style);
        
        // 2. Teraz modyfikujemy sam element
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          // Usuwamy style kontenera (cienie, tła, radiusy)
          clonedElement.style.background = 'transparent';
          clonedElement.style.backgroundColor = 'transparent';
          clonedElement.style.boxShadow = 'none';
          clonedElement.style.border = 'none';
          clonedElement.style.backdropFilter = 'none';
          clonedElement.style.padding = '0';
          clonedElement.style.margin = '0';
          clonedElement.style.width = 'auto';
          clonedElement.style.height = 'auto';
          clonedElement.style.position = 'static';
          clonedElement.style.display = 'block';
          clonedElement.style.visibility = 'visible';
          clonedElement.style.overflow = 'visible';
          
          // Usuwamy klasy które mogą powodować ukrywanie
          clonedElement.classList.remove('mobile-hidden', 'hidden');
          
          // Wrapper
          const wrappers = clonedElement.querySelectorAll('.svg-wrapper');
          wrappers.forEach(w => {
            w.style.background = 'transparent';
            w.style.boxShadow = 'none';
            w.style.border = 'none';
            w.style.padding = '0';
            w.style.margin = '0';
            w.style.width = '100%';
            w.style.display = 'block';
          });
          
          // Czapka2 - pełny reset
          const czapki = clonedElement.querySelectorAll('.czapka2');
          czapki.forEach(c => {
            c.style.width = 'auto';
            c.style.padding = '0';
            c.style.paddingTop = '0';
            c.style.margin = '0';
            c.style.transform = 'none';
          });
          
          // Pompony - pełny reset
          const pompons = clonedElement.querySelectorAll('.pompon');
          pompons.forEach(p => {
            p.style.transform = 'none';
            p.style.right = 'auto';
            p.style.top = 'auto';
            p.style.left = 'auto';
            p.style.bottom = 'auto';
            p.style.position = 'relative';
          });
          
          // SVG - upewniamy się że są pełne
          const svgs = clonedElement.querySelectorAll('svg');
          svgs.forEach(svg => {
            svg.style.width = '100%';
            svg.style.height = 'auto';
            svg.style.display = 'block';
          });
        }
      };

      const options = {
        scale: 4, 
        useCORS: true,
        backgroundColor: null, 
        logging: false,
        windowWidth: 1920,
        windowHeight: 1080,
        allowTaint: false,
        removeContainer: true,
        foreignObjectRendering: false
      };

      console.log("📸 Renderowanie czapek...");
      const logoUrl = config?.customLogo || defaultLogo;
      
      // --- POPRAWKA TUTAJ ---
      // 1. Dodaliśmy 'logoObj' do tablicy po lewej stronie
      const [canvas1, canvas2, bgImage, logoObj] = await Promise.all([
        html2canvas(element1, {
          ...options,
          onclone: (doc) => prepareClone(doc, 'print-flat-container')
        }),
        html2canvas(element2, {
          ...options,
          onclone: (doc) => prepareClone(doc, 'print-front-container')
        }),
        loadImageAsBase64('/src/assets/headwearbg2.jpg'),
        loadImageAsBase64(logoUrl) 
      ]);

      const imgData1 = canvas1.toDataURL('image/png');
      const imgData2 = canvas2.toDataURL('image/png');

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [2000, 1100],
        putOnlyUsedFonts: true,
        floatPrecision: 16
      });
      const pageWidth = doc.internal.pageSize.getWidth(); 
      const pageHeight = doc.internal.pageSize.getHeight(); 

      console.log("🖼️ Dodawanie tła...");
      
      // --- POPRAWKA TUTAJ ---
      // bgImage to teraz obiekt {data, width, height}, więc musimy użyć bgImage.data
      if (bgImage) {
          doc.addImage(bgImage.data, 'JPEG', 0, 0, 2000, 1100);
      }

      // --- POPRAWKA LOGO ---
      // Teraz logoObj istnieje, więc ten IF zadziała
      if (logoObj) {
        const isCustomLogo = !!config?.customLogo;
        const desiredWidth = isCustomLogo ? 150 : 300;
        const desiredHeight = (logoObj.height / logoObj.width) * desiredWidth;
        
     
        let logoX, logoY;

        if (isCustomLogo) {
          logoX = pageWidth - desiredWidth - 50;
          logoY = 30;
        } else {
          logoX = pageWidth - desiredWidth + 10; 
          logoY = -10;
        }

       
        doc.addImage(logoObj.data, 'PNG', logoX, logoY, desiredWidth, desiredHeight);
      }

      const margin = 240;
      const availableWidth = pageWidth - (margin * 3);
      const boxWidth = availableWidth / 2;
      
      const ratio1 = canvas1.height / canvas1.width;
      const ratio2 = canvas2.height / canvas2.width;
      
      const boxHeight1 = boxWidth * ratio1;
      const boxHeight2 = boxWidth * ratio2;
      
      const maxHeight = Math.max(boxHeight1, boxHeight2);
      const yPos = (pageHeight - maxHeight) / 2;

      const isSmallScreen = window.innerWidth <= 768;
      // Używamy config przekazanego w argumencie
      const hasPompon = config?.pompons?.show;

      if(isSmallScreen){
        if(!hasPompon){
          doc.addImage(imgData1, 'JPEG', margin + 60, yPos - 200, boxWidth, boxHeight1);
          doc.addImage(imgData2, 'JPEG', margin + 810, yPos + 170, boxWidth, boxHeight2);
        }
        else{
          doc.addImage(imgData1, 'JPEG', margin + 60, yPos - 200, boxWidth, boxHeight1);
          doc.addImage(imgData2, 'JPEG', margin + 810, yPos + 40, boxWidth, boxHeight2);
        }
      }
      else{
        if(!hasPompon){
          doc.addImage(imgData1, 'JPEG', margin + 100, yPos - 400, boxWidth, boxHeight1);
          doc.addImage(imgData2, 'JPEG', margin + 810, yPos + 370, boxWidth, boxHeight2);
        }
        else{
          doc.addImage(imgData1, 'JPEG', margin + 100, yPos - 400, boxWidth, boxHeight1);
          doc.addImage(imgData2, 'JPEG', margin + 810, yPos + 230, boxWidth, boxHeight2);
        }
      }

      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55); 
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128); 

      doc.save(`HEADWEAR-Wizualizacja-${Date.now()}.pdf`);

      console.log("✅ PDF wygenerowany pomyślnie!");
      return true;
    } catch (err) {
      console.error("❌ Błąd generowania PDF:", err);
      alert("Wystąpił błąd podczas generowania pliku PDF.");
      return false;
    }
  };

  return {
    generatePdf
  };
}