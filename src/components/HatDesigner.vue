<template>
  <div class="svg-container">
    
    <div v-if="isInitLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Wczytuję projekt...</p>
    </div>

    <template v-else>
      
      <TopBar 
        @download="handleDownloadRequest" 
        :isDownloading="isDownloading"
        :hatConfig="hatConfig"
        :projectId="route.params.id || null"
        :currentStatus="projectStatus"
      />

      <div class="fade-in-content content-layout">
        
        <Formularz 
          :config="hatConfig" 
          :dictionaries="dictionaryData"
        />
        
        <div id="print-flat-container" class="d-flex">
          <HatFlat :config="hatConfig" :patternsDict="dictionaryData.patterns"/>
        </div>
    
        <div id="print-front-container">
          <HatFront :config="hatConfig" :show-pompon="true" :patternsDict="dictionaryData.patterns"/>
        </div>

      </div>
    </template>

  </div>
</template>
  <script setup>
  import { reactive, watch, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import Formularz from './Formularz.vue';
  import TopBar from './TopBar.vue';
  import HatFlat from './hat/HatFlat.vue';
  import HatFront from './hat/HatFront.vue';
  import { defaultConfig, loadConfig, saveConfig } from '../utils/hatConfig.js';
  import { usePdfGenerator } from '../utils/usePdfGenerator.js'; 
  // DODANO IMPORT projectAPI
  import { dictionaryAPI, projectAPI } from '../utils/axios.js';
  
  const isDownloading = ref(false);
  const isInitLoading = ref(true);
  const route = useRoute(); 
  const router = useRouter();
  const { generatePdf } = usePdfGenerator();
  
  // Reaktywny konfig
  const hatConfig = reactive(JSON.parse(JSON.stringify(defaultConfig)));
  
  // Słowniki
  const dictionaryData = ref({
    colors: [],
    patterns: [],
    fonts: []
  });
  
  // --- GŁÓWNA LOGIKA INICJALIZACJI ---
 // Upewnij się, że masz zdefiniowaną zmienną na status
const projectStatus = ref('NOWY');

onMounted(async () => {
  try {
    // KROK 1: Pobierz Słowniki (Bez zmian)
    const [colorsRes, patternsRes, fontsRes] = await Promise.all([
      dictionaryAPI.getColors(),
      dictionaryAPI.getPatterns(),
      dictionaryAPI.getFonts()
    ]);
    
    dictionaryData.value.colors = colorsRes.data;
    dictionaryData.value.patterns = patternsRes.data;
    dictionaryData.value.fonts = fontsRes.data;

    // KROK 2: Sprawdź czy to wejście z Linku
    if (route.params.id) {
      console.log("Tryb odczytu projektu: ", route.params.id);
      
      // Pobieramy z bazy (teraz przychodzi wrapper ze statusem)
      const response = await projectAPI.getProject(route.params.id);
      
      // 1. Wyciągamy STATUS (do blokowania przycisku)
      if (response.data.status) {
         projectStatus.value = response.data.status;
         console.log("Status projektu:", projectStatus.value);
      }

      // 2. Wyciągamy KONFIGURACJĘ (jest teraz głębiej, w polu .config)
      // TU BYŁ BŁĄD: wcześniej brałeś całe response.data
      const savedConfig = response.data.config; 

      // 3. Nadpisujemy czapkę tylko jeśli config istnieje
      if (savedConfig) {
          // Ważne: czyścimy stary config i wpisujemy nowy, 
          // ale Object.assign jest bezpieczny dla reaktywności
          Object.assign(hatConfig, savedConfig);
          console.log("Załadowano konfigurację z serwera!");
      } else {
          console.warn("Otrzymano projekt, ale brak w nim konfiguracji JSON!");
      }
        
    } else {
      // KROK 3: Tryb normalny - wczytaj z LocalStorage
      console.log("Tryb normalny - wczytuję z LocalStorage");
      const savedConfig = loadConfig();
      if (savedConfig) {
        Object.assign(hatConfig, savedConfig);
      }
      // Resetujemy status na NOWY dla trybu roboczego
      projectStatus.value = 'NOWY';
    }

  } catch (e) {
    console.error("Błąd krytyczny inicjalizacji:", e);
    alert("Nie udało się załadować projektu.");
    router.push('/');
  } finally {
    // Zdejmujemy loader
    isInitLoading.value = false;
  }
});


  watch(hatConfig, (newVal) => {

  updateCssVariables(newVal.base);

  if (!route.params.id) {
    saveConfig(newVal);
  } else {
    console.log("Tryb podglądu - pomijam auto-zapis do localStorage");
  }
}, { deep: true });
  
  
  // --- PDF GENERATOR ---
  const handleDownloadRequest = async (type) => {
    if (type === "pdf") {
      isDownloading.value = true;
      try {
        setTimeout(async () => {
           await generatePdf();
           isDownloading.value = false;
        }, 100);
      } catch (e) {
        console.error(e);
        isDownloading.value = false;
      }
    }
  };
  
  // --- CSS VARIABLES ---
  const hexToRgbString = (hex) => {
    if (!hex) return '255, 255, 255'; 
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
  };
  
  const updateCssVariables = (base) => {
      if (base?.top && base?.bottom) {
        const topRgb = hexToRgbString(base.top);
        const bottomRgb = hexToRgbString(base.bottom);
        document.body.style.setProperty('--rgb-top', topRgb);
        document.body.style.setProperty('--rgb-bottom', bottomRgb);
      }
  };
  
  // Inicjalne ustawienie CSS (jeśli są domyślne wartości)
  updateCssVariables(hatConfig.base);
  
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

  .loading-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #1f2937;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #1f2937;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.fade-in-content {
  animation: fadeIn 0.5s ease-out;
  width: 100%; 
  display: flex; 
  flex-wrap: wrap;
  gap: 30px;
  justify-content: center;
}

.content-layout {
  width: 100%;
  display: flex;          
  flex-wrap: wrap;        
  gap: 30px;              
  justify-content: center; 
  padding-top: 100px;     
}

.fade-in-content {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; } 
  to { opacity: 1; }
}



  </style>