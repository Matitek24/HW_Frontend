<template>
    <div class="svg-container">
      <TopBar 
        @download="handleDownloadRequest" 
        :isDownloading="isDownloading"
        :hatConfig="hatConfig"
      />
      <Formularz 
      :config="hatConfig" 
      :dictionaries="dictionaryData"
    />
    
    <div id="print-flat-container" class="d-flex">
      <HatFlat 
        :config="hatConfig" 
        :patternsDict="dictionaryData.patterns" 
      />
    </div>

    <div id="print-front-container">
      <HatFront 
        :config="hatConfig" 
        :show-pompon="true"
        :patternsDict="dictionaryData.patterns"
      />
    </div>
  
    </div>
  </template>
  <script setup>
  import { reactive, watch, onMounted, ref, computed } from 'vue';
  import Formularz from './Formularz.vue';
  import TopBar from './TopBar.vue';
  import HatFlat from './hat/HatFlat.vue';
  import HatFront from './hat/HatFront.vue';
  import { defaultConfig, loadConfig, saveConfig } from '../utils/hatConfig.js';
  import { usePdfGenerator } from '../utils/usePdfGenerator.js'; 
  import { dictionaryAPI } from '../utils/axios.js';
  
  const isDownloading = ref(false);
  
  const { generatePdf } = usePdfGenerator();
  
  const hatConfig = reactive(JSON.parse(JSON.stringify(defaultConfig)));

  const dictionaryData = ref({
  colors: [],
  patterns: [],
  fonts: []
});
  const handleDownloadRequest = async (type) => {
    if (type === "pdf") {
      // 1. Włączamy loading
      isDownloading.value = true;
      
      try {
        // 2. Wywołujemy funkcję z oddzielnego pliku
        // setTimeout daje czas Vue na odświeżenie UI (pokazanie spinnera)
        setTimeout(async () => {
           await generatePdf();
           // 3. Wyłączamy loading po zakończeniu
           isDownloading.value = false;
        }, 100);
        
      } catch (e) {
        console.error(e);
        isDownloading.value = false;
      }
    }
  };
  
  // Wczytanie zapisanej konfiguracji przy starcie
  onMounted(() => {
    const savedConfig = loadConfig();
    if (savedConfig) {
      Object.assign(hatConfig, savedConfig);
    }
  });
  
  // Automatyczny zapis przy każdej zmianie
  watch(hatConfig, (newVal) => {
    saveConfig(newVal);
  }, { deep: true });
  
  // --- USUNĄŁEM STARĄ FUNKCJĘ handleDownloadRequest STĄD ---
  
  const downloadAsSVG = () => {
    // Logika eksportu do SVG
    const svgElement = document.querySelector('#Warstwa_1');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'czapka-flat.svg';
      link.click();
      URL.revokeObjectURL(url);
    }
  };
  
  
  const hexToRgbString = (hex) => {
    if (!hex) return '255, 255, 255'; 
    
    hex = hex.replace(/^#/, '');
    
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    
    const num = parseInt(hex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    
    return `${r}, ${g}, ${b}`;
  };
  
  watch(
    () => hatConfig.base,
    (newBase) => {
      if (newBase?.top && newBase?.bottom) {
        const topRgb = hexToRgbString(newBase.top);
        const bottomRgb = hexToRgbString(newBase.bottom);
  
        // Ustawiamy same cyferki RGB jako zmienne
        document.body.style.setProperty('--rgb-top', topRgb);
        document.body.style.setProperty('--rgb-bottom', bottomRgb);
      }
    },
    { deep: true, immediate: true }
  );

  // pobiera dane z API słowników
  onMounted(async () => {
  try {
    const [colorsRes, patternsRes, fontsRes] = await Promise.all([
      dictionaryAPI.getColors(),
      dictionaryAPI.getPatterns(),
      dictionaryAPI.getFonts()
    ]);
    
    dictionaryData.value.colors = colorsRes.data;
    dictionaryData.value.patterns = patternsRes.data;
    dictionaryData.value.fonts = fontsRes.data;
    
  } catch (e) {
    console.error("Błąd pobierania słowników", e);
  }
});
  </script>
  
  <style>
  .svg-container {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 30px; 
    justify-content: center;
    padding-bottom: 8rem;
  }
  
  .svg-wrapper {
    min-width: 300px;
    width: 546px;
    background: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(16px) saturate(120%);
    -webkit-backdrop-filter: blur(16px) saturate(120%); 
    border-radius: 24px;
    padding: 30px; 
    box-shadow:
      0 8px 20px -5px rgba(0, 0, 0, 0.06), 
      inset 0 1px 2px rgba(255, 255, 255, 0.8);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  }
  
  .svg-wrapper:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.75); 
    box-shadow:
      0 12px 30px -8px rgba(0, 0, 0, 0.1),
      inset 0 1px 2px rgba(255, 255, 255, 1);
    border-color: rgba(255, 255, 255, 0.8);
  }
  
  .svg-wrapper svg {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 16px;
  }
  
  body {
    --rgb-top: 255, 255, 255;  
    --rgb-bottom: 255, 255, 255;

    background-color: #ffffff;
    background-image:
  radial-gradient(at 10% 10%, rgba(var(--rgb-top), 0.1) 0px, transparent 50%),
  radial-gradient(at 90% 90%, rgba(var(--rgb-bottom), 0.13) 0px, transparent 50%);

    background-attachment: fixed;
    min-height: 100vh;
    transition: background-image 0.5s ease-in-out;
}
  
  .pasek {
    fill: var(--kolor-pasek);
  }
  </style>