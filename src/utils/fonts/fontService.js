// fonts/fontService.js
// Pobiera dane fontu z jednego z dwóch źródeł:
//  - font.fileUrl   -> plik z backendu (fetch)
//  - font.legacyKey -> stary fontLibrary (lazy import Base64)
// i udostępnia je jako FontFace (UI, canvas) oraz Base64 (SVG).
import { loadLegacyBase64 } from './legacyFonts.js';

const bufferCache = new Map();   // family -> Promise<ArrayBuffer>
const faceCache = new Map();     // family -> Promise<void>

function base64ToBuffer(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

function bufferToBase64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

/** ArrayBuffer fontu albo null dla fontów systemowych. Cache po family. */
function getBuffer(font) {
  if (!font.fileUrl && !font.legacyKey) return Promise.resolve(null);
  if (!bufferCache.has(font.family)) {
    const p = (async () => {
      if (font.fileUrl) {
        const r = await fetch(font.fileUrl);
        if (!r.ok) throw new Error(`Font ${font.fileUrl}: HTTP ${r.status}`);
        return r.arrayBuffer();
      }
      return base64ToBuffer(await loadLegacyBase64(font.legacyKey));
    })();
    p.catch(() => bufferCache.delete(font.family));
    bufferCache.set(font.family, p);
  }
  return bufferCache.get(font.family);
}

/** Rejestruje font w document.fonts i czeka na załadowanie. Systemowe pomija. */
export function loadFont(font) {
  if (!faceCache.has(font.family)) {
    const p = (async () => {
      const buf = await getBuffer(font);
      if (!buf) return;
      const face = new FontFace(font.family, buf, { weight: font.bold ? 'bold' : 'normal' });
      await face.load();
      document.fonts.add(face);

      // MAGIA: Wstrzykujemy czcionkę globalnie do HTML, co naprawi rozwijane panele i Selecty!
      const b64 = bufferToBase64(buf);
      const style = document.createElement('style');
      style.setAttribute('data-font', font.family);
      style.textContent = `
        @font-face {
          font-family: '${font.family}';
          src: url(data:font/ttf;base64,${b64}) format('truetype');
          font-weight: ${font.bold ? 'bold' : 'normal'};
          font-style: normal;
        }
      `;
      document.head.appendChild(style);
    })();
    p.catch(() => faceCache.delete(font.family));
    faceCache.set(font.family, p);
  }
  return faceCache.get(font.family);
}

/** Base64 fontu (bez prefiksu data:) albo null dla systemowych. */
export async function getFontBase64(font) {
  const buf = await getBuffer(font);
  return buf ? bufferToBase64(buf) : null;
}

/** Wstrzykuje @font-face (Base64) do SVG renderowanego jako <img>. Mutuje i zwraca svgEl. */
export async function embedFontFace(svgEl, font) {
  const b64 = await getFontBase64(font);
  if (!b64) return svgEl;
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = `
    @font-face {
      font-family: '${font.family}';
      src: url(data:font/ttf;base64,${b64}) format('truetype');
      font-weight: ${font.bold ? 'bold' : 'normal'};
      font-style: normal;
    }`;
  svgEl.insertBefore(style, svgEl.firstChild);
  return svgEl;
}