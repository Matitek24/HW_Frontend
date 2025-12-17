// utils/exportSvg.js

export function exportSvgToImage(svgEl, {
  type = 'image/png',
  scale = 3,
  filename = 'export.png',
  pomponEl = null 
} = {}) {

  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgEl);
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  return new Promise((resolve, reject) => {
    img.onload = async () => {
      try {

        const PADDING_TOP = 200; 

        const POMPON_VISUAL_SCALE = 1.3; 

        const POMPON_OFFSET_Y = -10; 


        const viewBox = svgEl.viewBox.baseVal;
        const svgW = viewBox.width || 500;
        const svgH = viewBox.height || 500;

        const canvas = document.createElement('canvas');
        
        canvas.width = svgW * scale;
        canvas.height = (svgH + PADDING_TOP) * scale;

        const ctx = canvas.getContext('2d');

        await document.fonts.ready; 
        await new Promise(r => setTimeout(r, 250));

        ctx.drawImage(
          img, 
          0,                     
          PADDING_TOP * scale,   
          svgW * scale,          
          svgH * scale            
        );
        URL.revokeObjectURL(url);

        if (pomponEl) {
           const pStr = serializer.serializeToString(pomponEl);
           const pBlob = new Blob([pStr], { type: 'image/svg+xml;charset=utf-8' });
           const pUrl = URL.createObjectURL(pBlob);
           const pImg = new Image();

           await new Promise((resP) => {
              pImg.onload = () => {
                 // Obliczamy rozmiar pompona
                 // (Oryginalny rozmiar SVG pompona * Skala wizualna * Jakość)
                 const pBaseW = pImg.width || 100; // domyślnie 100 jak nie znajdzie
                 const pBaseH = pImg.height || 100;
                 
                 const finalPomponW = pBaseW * POMPON_VISUAL_SCALE * scale; // Tutaj on rośnie!
                 const finalPomponH = pBaseH * POMPON_VISUAL_SCALE * scale;

                 // Centrowanie w poziomie (Szerokość Canvasa - Szerokość Pompona) / 2
                 const pX = (canvas.width - finalPomponW) / 2 - 320;
                 
                 // Pozycja w pionie (Twoje ustawienie)
                 const pY = POMPON_OFFSET_Y * scale;

                 ctx.drawImage(pImg, pX, pY, finalPomponW, finalPomponH);
                 
                 URL.revokeObjectURL(pUrl);
                 resP();
              };
              pImg.src = pUrl;
           });
        }

        const dataUrl = canvas.toDataURL(type, 1.0);
        
    
        if (filename) {
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = filename;
          a.click();
        }

        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (e) => {
      reject(new Error('Błąd SVG'));
    };

    img.src = url;
  });
}