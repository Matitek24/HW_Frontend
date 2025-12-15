// utils/hatConfig.js

const STORAGE_KEY = 'moj_projekt_czapki_v1';

export const defaultConfig = {
  text: {
    content: 'KONFIGURATOR M38-H',
    color: '#3E87CB',
    font: 'impact',
    fontSize: 112,
    offsetY: 0
  },
  base: {
    top: '#01426A',
    middle: '#D6D2C4',
    bottom: '#7FADE3'
  },
  pattern: {
    main: '#E8E4D6',
    top: '#C7C3B2'
  },
  pompons: {
    show: true,
    p1: '#B79A81',
    p2: '#C7C3B2',
    p3: '#B79A81',
    p4: '#C7C3B2'
  },
  patterns: {
    top: 17,
    bottom: 32
  }
};


export const loadConfig = () => {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    try {
      return JSON.parse(savedData);
    } catch (e) {
      console.error('Błąd odczytu konfiguracji:', e);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }
  return null;
};

/**
 * Zapisuje konfigurację do localStorage
 */
export const saveConfig = (config) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error('Błąd zapisu konfiguracji:', e);
    return false;
  }
};

/**
 * Usuwa zapisaną konfigurację
 */
export const clearConfig = () => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Tworzy głęboką kopię konfiguracji
 */
export const cloneConfig = (config) => {
  return JSON.parse(JSON.stringify(config));
};
