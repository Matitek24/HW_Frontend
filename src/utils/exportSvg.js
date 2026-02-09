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
          // KLUCZOWA POPRAWKA DLA CHROME: 
          // Robimy głęboką kopię, aby nie zepsuć oryginału na ekranie
          const pClone = pomponEl.cloneNode(true);
          const pVB = pClone.viewBox.baseVal;
          
          // Chrome potrzebuje jawnych wymiarów, aby poprawnie narysować Image na Canvas
          pClone.setAttribute('width', pVB.width);
          pClone.setAttribute('height', pVB.height);
       
          const pStr = serializer.serializeToString(pClone);
          const pBlob = new Blob([pStr], { type: 'image/svg+xml;charset=utf-8' });
          const pUrl = URL.createObjectURL(pBlob);
          const pImg = new Image();
       
          await new Promise((resP) => {
             pImg.onload = () => {
                const pBaseW = pVB.width || 904.77; 
                const pBaseH = pVB.height || 259.81;
                
                const finalPomponW = pBaseW * POMPON_VISUAL_SCALE * scale;
                const finalPomponH = pBaseH * POMPON_VISUAL_SCALE * scale;
       
                const hatCenterX = (svgW * scale) / 2 - 320;
                const pX = hatCenterX - (finalPomponW / 2);
                
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