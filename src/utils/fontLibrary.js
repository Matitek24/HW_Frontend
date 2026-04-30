// src/utils/fonts/fontLibrary.js

// Zamiast importować wszystko od razu na górze (co zatyka aplikację),
// tworzymy słownik, w którym przechowujemy FUNKCJE do pobierania czcionek.
// Vite automatycznie "wytnie" pliki Base64 z głównego bundle'a!

export const fontLibrary = {
  'arial': {
    // Zwróć uwagę na ()=> import(...) to kluczowy element!
    loader: () => import('./fonts/ArialBase64.js').then(m => m.Arial),
    format: 'truetype',
    weight: 'normal'
  },
  'arialbold': {
    loader: () => import('./fonts/ArialBoldBase64.js').then(m => m.arialBold),
    format: 'truetype',
    weight: 'bold' 
  },
  'calibri': {
    loader: () => import('./fonts/CalibriBase64.js').then(m => m.calibri),
    format: 'truetype',
    weight: 'normal'
  },
  'impact': {
    loader: () => import('./fonts/ImpactBase64.js').then(m => m.Impact),
    format: 'truetype',
    weight: 'normal'
  },
  'gothic': {
    loader: () => import('./fonts/MsGothicBase64.js').then(m => m.msgothic),
    format: 'truetype',
    weight: 'normal'
  },
  'roboto': {
    loader: () => import('./fonts/Roboto-Regular.js').then(m => m.fontBase64),
    format: 'truetype',
    weight: 'normal'
  },
  'tahoma': {
    loader: () => import('./fonts/TahomaBase64.js').then(m => m.tahoma),
    format: 'truetype',
    weight: 'normal'
  }
};