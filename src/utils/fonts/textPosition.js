// fonts/textPosition.js
// JEDYNE miejsce z wzorami na pozycję tekstu. Używają go: HatFlat.vue, HatFront.vue,
// captureFlatHat (PDF + karta produkcyjna) i kalibrator. Dzięki temu admin widzi w modalu
// dokładnie to, co wyjdzie w PDF.

export const FLAT_BASE_Y = 395;
export const FLAT_CENTER_X = 658.14;
export const FRONT_BASE_Y = 19;

// Front: czapka 3D jest mniejsza od płaskiej
const FLAT_HEIGHT = 79.5;
const HAT_3D_HEIGHT = 114.74;
export const FRONT_SCALE = FLAT_HEIGHT / HAT_3D_HEIGHT;

// Canvas rysuje z textBaseline='alphabetic', a SVG używa dominant-baseline='central'.
// Ta stała zastępuje stare "multiplier = isEdge ? 0.4 : 0.4".
export const CANVAS_BASELINE_K = 0.4;

/** Flat: wartość `y` dla <text> w SVG (dominant-baseline: central). */
export function flatTextY(font, fontSize = 64, offsetY = 0) {
  const { shift, pivot } = font.flat;
  return FLAT_BASE_Y + shift + -(offsetY || 0) * 0.85 + fontSize * pivot;
}

/** Flat: `y` do ctx.fillText przy textBaseline='alphabetic'. */
export function flatCanvasY(font, fontSize = 64, offsetY = 0, scale = 1) {
  return (flatTextY(font, fontSize, offsetY) + fontSize * CANVAS_BASELINE_K) * scale;
}

/** Front: rozmiar i `dy` dla <text><textPath>. */
export function frontTextProps(font, fontSize = 40, offsetY = 0) {
  const finalFontSize = fontSize * FRONT_SCALE * 1.03;
  const { shift, pivot } = font.front;
  return {
    fontSize: finalFontSize,
    dy: FRONT_BASE_Y + shift + -(offsetY || 0) * FRONT_SCALE + finalFontSize * pivot,
  };
}
