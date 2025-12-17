// src/utils/embedFont.js
import { fontLibrary } from './fontLibrary';

export function embedCurrentFont(svgEl, fontName) {
  const clone = svgEl.cloneNode(true);
  const fontData = fontLibrary[fontName];

  if (!fontData || !fontData.base64) {
    return clone;
  }

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');

  // Tworzymy @font-face wewnątrz SVG
  style.textContent = `
    @font-face {
      font-family: '${fontName}';
      src: url(data:font/${fontData.format};base64,${fontData.base64}) format('${fontData.format}');
      font-weight: ${fontData.weight};
      font-style: normal;
    }
    
    /* Wymuszenie fontu na tekstach */
    text {
      font-family: '${fontName}' !important;
      font-weight: ${fontData.weight} !important;
    }
  `;

  defs.appendChild(style);
  clone.insertBefore(defs, clone.firstChild);
  
  return clone;
}