// src/utils/fontLoader.js
import { fontLibrary } from '../fontLibrary'; // Ścieżka do pliku wyżej

export async function ensureFontLoaded(fontName) {
  const fontData = fontLibrary[fontName];

  if (!fontData) {
    return false;
  }

  if (fontData.base64) {
      return true;
  }

  try {
    
    const base64String = await fontData.loader();
    
    fontData.base64 = base64String; 

    const fontFace = new FontFace(
      fontName,
      `url(data:font/${fontData.format};base64,${base64String})`,
      {
        style: 'normal',
        weight: fontData.weight
      }
    );

    const loadedFace = await fontFace.load();
    document.fonts.add(loadedFace);
    
    return true;

  } catch (err) {
    console.error("Błąd ładowania czcionki:", err);
    return false;
  }
}