// src/utils/fontLoader.js
import { fontLibrary } from '../fontLibrary'; // Ścieżka do pliku wyżej

export async function ensureFontLoaded(fontName) {
  // Pobieramy dane fontu na podstawie nazwy z bazy (np. "MS Gothic")
  const fontData = fontLibrary[fontName];

  if (!fontData) {
    return Promise.resolve();
  }

  // Sprawdzamy czy przeglądarka już go ma
  const checkSyntax = fontData.weight === 'bold' ? `bold 12px "${fontName}"` : `12px "${fontName}"`;
  if (document.fonts.check(checkSyntax)) {
    return Promise.resolve();
  }


  try {
    const fontFace = new FontFace(
      fontName, // Ta nazwa będzie używana w CSS
      `url(data:font/${fontData.format};base64,${fontData.base64})`,
      {
        style: 'normal',
        weight: fontData.weight
      }
    );

    const loadedFace = await fontFace.load();
    document.fonts.add(loadedFace);
    
    return true;

  } catch (err) {
    return false;
  }
}