// fonts/legacyFonts.js
// Dotychczasowe wartości z kodu, używane dopóki w bazie nie ma własnych.
// Klucz = nazwa fontu małymi literami (tak jak w starym FONT_TUNING).
import { fontLibrary } from '../fontLibrary.js';

// FLAT: skopiowane z HatFlat.vue / useGeneratorWizualizacji.js
const FLAT = {
  impact:    { shift: 4, pivot: -0.01 },
  roboto:    { shift: 4, pivot: 0.0 },
  arialbold: { shift: 6, pivot: -0.06 },
  arial:     { shift: 2, pivot: 0.02 },
  tahoma:    { shift: 5, pivot: -0.05 },
  default:   { shift: 8, pivot: -0.05 },
};

// FRONT: skopiowane z HatFront.vue
// (w starym kodzie 'tahoma' było zdefiniowane dwa razy, w JS wygrywa ostatnie: shift 0, pivot 0.32)
const FRONT = {
  impact:    { shift: 0,  pivot: 0.36 },
  roboto:    { shift: -1, pivot: 0.32 },
  arialbold: { shift: -2, pivot: 0.34 },
  arial:     { shift: -1, pivot: 0.33 },
  tahoma:    { shift: 0,  pivot: 0.32 },
  default:   { shift: -2, pivot: 0.34 },
};

// Zastępuje ['tahoma', 'arialbold'] wpisane z ręki w template'ach
const BOLD = new Set(['arialbold', 'tahoma']);

export const legacyFlat = (key) => FLAT[key] || FLAT.default;
export const legacyFront = (key) => FRONT[key] || FRONT.default;
export const legacyBold = (key) => BOLD.has(key);
export const hasLegacyFont = (key) => !!fontLibrary[key];
export const legacyKeys = () => Object.keys(fontLibrary);

/** Base64 pliku ze starego fontLibrary (czysty, bez prefiksu data:). */
export async function loadLegacyBase64(key) {
  const raw = await fontLibrary[key].loader();
  return raw.includes(',') ? raw.split(',')[1] : raw;
}
