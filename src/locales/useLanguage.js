import { ref } from 'vue';
import pl from './pl.json';
import en from './en.json';

const currentLocale = ref('pl');


const flattenDictionary = (obj, prefix = '') => {
  return Object.keys(obj).reduce((acc, key) => {
    const newPrefix = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(acc, flattenDictionary(obj[key], newPrefix));
    } else {
     
      acc[newPrefix] = obj[key];
    }
    return acc;
  }, {});
};

const flatTranslations = {
  pl: flattenDictionary(pl),
  en: flattenDictionary(en)
};

export function useLanguage() {
  const t = (path) => {
    return flatTranslations[currentLocale.value][path] || path;
  };

  const toggleLanguage = () => {
    currentLocale.value = currentLocale.value === 'pl' ? 'en' : 'pl';
  };

  return {
    currentLocale,
    t,
    toggleLanguage
  };
}