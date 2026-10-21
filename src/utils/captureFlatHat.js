// captureFlatHat.js
import { inlineStyles } from './inlineStyles.js';
import { getFont } from './fonts/fontsStore.js';
import { loadFont, embedFontFace } from './fonts/fontService.js';

const loadImg = (src) =>
  new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

export async function captureFlatHat(svgElement, config, opts = {}) {
  const { scale = 1, format = 'jpeg', quality = 0.8, useInlineStyles = true } = opts;
  if (!svgElement) return null;

  try {
    // 1. Zewnętrzne ładowanie fontu
    const font = getFont(config.text?.font);
    await loadFont(font);
    await document.fonts.ready;

    const vb = svgElement.viewBox.baseVal;
    const vW = vb.width || 1316.28;
    const vH = vb.height || 800.63;
    const canvas = document.createElement('canvas');
    canvas.width = vW * scale;
    canvas.height = vH * scale;
    const ctx = canvas.getContext('2d');

    // 2. Klonujemy SVG z tekstem, ale USUWAJĄC stare renderowanie logotypu 
    // (logo zawsze renderujemy ręcznie po wygenerowaniu SVG, bo często cierpi na CORS)
    const clone = svgElement.cloneNode(true);

    clone.querySelectorAll('.logo-image-exclude, .logo-placeholder-exclude').forEach(el => el.remove());    
      const prepared = useInlineStyles
        ? inlineStyles(svgElement, true)   // oryginał z DOM, nie clone
        : svgElement.cloneNode(true);

      prepared
        .querySelectorAll('.logo-image-exclude, .logo-placeholder-exclude')
        .forEach(el => el.remove());

    // 3. Wstrzyknięcie czcionki w Base64 bezpośrednio do SVG
    await embedFontFace(prepared, font);   

    const svgData = new XMLSerializer().serializeToString(prepared);
    const url = URL.createObjectURL(new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' }));
    
    // ---------------------------------------------------------
    // ŻELAZNY FIX NA RACE CONDITION W PIASKOWNICY SVG (SANDBOX)
    // ---------------------------------------------------------
    // A) Robimy "brudny zrzut" - rysujemy jeden piksel, zmuszając przeglądarkę
    // do odczytania wnętrza Bloba (w tym zdekodowania naszego Base64)
    const warmUpImg = await loadImg(url);
    if (warmUpImg) ctx.drawImage(warmUpImg, 0, 0, 1, 1);
    
    // B) Twardy pauza, dająca silnikowi Chrome/Safari czas na zdekodowanie czcionki
    await new Promise(resolve => setTimeout(resolve, 350));
    
    // C) Drugi pobór obrazka - ten już będzie w 100% z nowym fontem
    const baseImg = await loadImg(url);
    URL.revokeObjectURL(url);
    
    if (!baseImg) throw new Error('Nie udało się wyrenderować SVG');

    // Czyścimy brudnopis i rysujemy finalną grafikę
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

    // ---------------------------------------------------------
    // RĘCZNE RYSOWANIE WŁASNEGO LOGOTYPU (Z przywróconej, dobrej wersji)
    // ---------------------------------------------------------
    if (config.logo && config.logo.url) {
      await new Promise((resolveLogo) => {
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        logoImg.onload = () => {
          const x = (658 + (config.logo.x || 0)) * scale;
          const y = (620 + (config.logo.y || 0)) * scale;
          const logoScale = config.logo.scale || 1;
          const maxSize = 150 * scale * logoScale; 

          let drawWidth = maxSize;
          let drawHeight = maxSize;

          if (logoImg.width > logoImg.height) {
            drawHeight = maxSize * (logoImg.height / logoImg.width);
          } else {
            drawWidth = maxSize * (logoImg.width / logoImg.height);
          }

          const drawX = x - drawWidth / 2;
          const drawY = y - drawHeight / 2;
          
          ctx.save();
          ctx.beginPath();
          ctx.rect(0.58 * scale, 512.74 * scale, 1313.78 * scale, 227.89 * scale);
          ctx.clip();
          ctx.drawImage(logoImg, drawX, drawY, drawWidth, drawHeight);
          ctx.restore();
          resolveLogo();
        };
        logoImg.onerror = () => resolveLogo();
        logoImg.src = config.logo.url;
      });
    }

    const mime = format === 'png' ? 'image/png' : 'image/jpeg';
    return { dataUrl: canvas.toDataURL(mime, quality), ratio: vW / vH };
  } catch (e) {
    console.error('captureFlatHat error:', e);
    return null;
  }
}