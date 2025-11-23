<template>
    <div class="svg-container">
      <TopBar @download="handleDownloadRequest" />
      <Formularz :config="hatConfig" />
      
      <!-- Płaska wizualizacja -->
      <HatFlat :config="hatConfig" />
      
      <!-- Widok z przodu z pomponem -->
      <HatFront :config="hatConfig" :show-pompon="true" />
    </div>
  </template>
  
  <script setup>
  import { reactive, watch, onMounted } from 'vue';
  import Formularz from './Formularz.vue';
  import TopBar from './TopBar.vue';
  import HatFlat from './hat/HatFlat.vue';
  import HatFront from './hat/HatFront.vue';
  import { defaultConfig, loadConfig, saveConfig } from '../utils/hatConfig.js';
  
  // Konfiguracja czapki
  const hatConfig = reactive(JSON.parse(JSON.stringify(defaultConfig)));
  
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
  
  // Obsługa pobierania
  const handleDownloadRequest = (type) => {
    // Implementacja pobierania - możesz dodać różne typy eksportu
    console.log('Download request:', type);
    
    // Przykład: pobranie jako SVG
    if (type === 'svg') {
      downloadAsSVG();
    } else if (type === 'png') {
      downloadAsPNG();
    }
  };
  
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
  
  const downloadAsPNG = () => {
    // Logika eksportu do PNG - możesz użyć html2canvas lub podobnej biblioteki
    console.log('PNG export - to implement');
  };
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
    background: linear-gradient(135deg, #f6f8fd 0%, #e2e8f0 100%);
    background-image:
      radial-gradient(at 10% 10%, rgba(99, 179, 237, 0.2) 0px, transparent 50%),
      radial-gradient(at 90% 90%, rgba(91, 144, 215, 0.243) 0px, transparent 50%);
  }
  
  .pasek {
    fill: var(--kolor-pasek);
  }
  </style>