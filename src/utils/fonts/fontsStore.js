// fonts/fontsStore.js
import { defineStore } from 'pinia';
import {
  legacyFlat, legacyFront, legacyBold, hasLegacyFont, legacyKeys,
} from './legacyFonts.js';

// Wartość z bazy, a jak jej nie ma (null/undefined) -> stary tuning
const pick = (dbVal, legacyVal) => (dbVal ?? legacyVal);
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
// Rekord z backendu -> obiekt używany we froncie
function fromDb(row) {
  const name = row.nazwa ?? row.name;
  // klucz starej biblioteki: wartosc ('arialbold', 'gothic'), a nie ładna nazwa
  const key = String(row.wartosc ?? name).toLowerCase().replace(/\s+/g, '');
  const isUploaded = !!row.fileUrl;
  const lf = legacyFlat(key);
  const lr = legacyFront(key);

  return {
    id: row.id,
    name,
    value: row.wartosc ?? key,
    family: `font_${row.id}`,
    fileUrl: row.fileUrl ?? null,
    legacyKey: isUploaded ? null : (hasLegacyFont(key) ? key : null),
    // wgrany plik: decyduje kolumna bold; stary font: stara lista (kolumna ma tu domyślne false)
    bold: isUploaded ? !!row.bold : legacyBold(key),
    flat:  { shift: pick(row.flatShift, lf.shift),  pivot: pick(row.flatPivot, lf.pivot) },
    front: { shift: pick(row.frontShift, lr.shift), pivot: pick(row.frontPivot, lr.pivot) },
  };
}

// Font, którego nie ma w bazie, ale jest w starym fontLibrary
function fromLegacy(key) {
  return {
    id: null,
    name: key,
    family: `legacy_${key}`,
    fileUrl: null,
    legacyKey: key,
    bold: legacyBold(key),
    flat: { ...legacyFlat(key) },
    front: { ...legacyFront(key) },
  };
}

// Font systemowy, o którym nic nie wiemy
function systemFallback(name) {
  return {
    id: null,
    name: name || 'Arial',
    family: name ? `"${name}", Arial, sans-serif` : 'Arial, sans-serif',
    fileUrl: null,
    legacyKey: null,
    bold: false,
    flat: { ...legacyFlat('default') },
    front: { ...legacyFront('default') },
  };
}

export const useFontsStore = defineStore('fonts', {
  state: () => ({ list: [], loaded: false }),   // list = rekordy z bazy (znormalizowane)

  getters: {
    /** Lista do dropdownu: fonty z bazy + stare, których jeszcze w bazie nie ma. */
    all(state) {
      const dbNames = new Set(state.list.map((f) => f.name.toLowerCase()));
      const legacy = legacyKeys().filter((k) => !dbNames.has(k)).map(fromLegacy);
      return [...state.list, ...legacy];
    },
  },

  actions: {
    async fetchFonts(force = false) {
      if (this.loaded && !force) return;
      try {
        // TUTAJ ZMIANA: Dodajemy pełny adres backendu przed /api/...
        const res = await fetch(`${API_BASE_URL}/api/public/fonts`);
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const textResponse = await res.text(); 
        try {
             this.list = JSON.parse(textResponse).map(fromDb);
        } catch (jsonErr) {
             console.error("Zwrócony tekst z serwera nie jest JSONem:", textResponse);
             throw new Error("Błąd parsowania JSON z endpointu fontów.");
        }
        
      } catch (e) {
        console.warn('Fonts: Backend niedostępny lub zwraca błędy. Używam legacyFonts.', e);
        this.list = [];
      }
      this.loaded = true;
    },
    /** Po id (nowe projekty) albo po nazwie (stare projekty). Zawsze zwraca obiekt. */
    getFont(idOrName) {
      if (idOrName == null || idOrName === '') return systemFallback();
      const key = String(idOrName).toLowerCase();

  
        const db = this.list.find((f) => String(f.id) === String(idOrName))
        || this.list.find((f) => f.value?.toLowerCase() === key)
        || this.list.find((f) => f.name.toLowerCase() === key);
      if (db) return db;

      if (hasLegacyFont(key)) return fromLegacy(key);
      return systemFallback(String(idOrName));
    },
  },
});

export const getFont = (idOrName) => useFontsStore().getFont(idOrName);
