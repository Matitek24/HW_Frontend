// utils/hatConfig.js

const STORAGE_KEY = 'moj_projekt_czapki_v1';

export const defaultConfig = {
  text: {
    content: 'HEADWEAR',
    color: '#1797ff',
    font: 'Arial, sans-serif',
    fontSize: 100,
    offsetY: 0
  },
  base: {
    top: '#1797ff',
    middle: '#f0f0f0',
    bottom: '#1797ff'
  },
  pattern: {
    main: '#1797ff',
    top: '#8ad4f1'
  },
  pompons: {
    show: true,
    p1: '#000000',
    p2: '#f0f0f0',
    p3: '#f0f0f0',
    p4: '#f0f0f0'
  },
  patterns: {
    top: 'snowflakes',
    bottom: 'triangles'
  }
};

/**
 * Wczytuje konfigurację z localStorage
 */
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