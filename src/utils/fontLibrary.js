// src/utils/fonts/fontLibrary.js

// 1. Importujemy Twoje zmienne z plików.
// Zwróć uwagę na nazwy w klamrach {} - muszą być IDENTYCZNE jak w Twoich plikach export const ...
import { Arial } from './fonts/ArialBase64.js';
import { arialBold } from './fonts/ArialBoldBase64.js';
import { calibri } from './fonts/CalibriBase64.js';
import { Impact } from './fonts/ImpactBase64.js';
import { msgothic } from './fonts/MsGothicBase64.js';
import { fontBase64 } from './fonts/Roboto-Regular.js'; // Tu nazwałeś zmienną fontBase64
import { tahoma } from './fonts/TahomaBase64.js';

// 2. Tworzymy bibliotekę mapującą:
// KLUCZ (lewa strona) = Nazwa z Twojej bazy danych (widoczna na screenie SQL)
// WARTOŚĆ (prawa strona) = Obiekt z base64 zaimportowany wyżej

export const fontLibrary = {
  'arial': {
    base64: Arial,
    format: 'truetype',
    weight: 'normal'
  },
  'arialbold': {
    base64: arialBold,
    format: 'truetype',
    weight: 'bold' // Oznaczamy, że to pogrubiona wersja
  },
  'calibri': {
    base64: calibri,
    format: 'truetype',
    weight: 'normal'
  },
  'impact': {
    base64: Impact,
    format: 'truetype',
    weight: 'normal'
  },
  'gothic': {
    base64: msgothic,
    format: 'truetype',
    weight: 'normal'
  },
  'roboto': {
    base64: fontBase64, // Twoja nazwa dla Roboto
    format: 'truetype',
    weight: 'normal'
  },
  'tahoma': {
    base64: tahoma,
    format: 'truetype',
    weight: 'normal'
  }
};