<template>
  <div class="svg-container no-scroll">

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
        :activeView="activeView" 
        @toggle-view="toggleView"
      />

      <div 
        class="fade-in-content content-layout" 
        :class="{ 
          'shifted': isBarExpanded,        
          'expanded-margin': isBarExpanded
        }"
        >
        
        <Formularz 
        :config="hatConfig" 
        :dictionaries="dictionaryData"
        @toggle-expand="(val) => isBarExpanded = val"
        @hover="handleHover"        @hover-end="handleHoverEnd" />
              
        <div 
            id="print-flat-container" 
            class="czapka flat-layout" 
            :class="{ 'is-active': activeView === 'flat' }"
          > 
          <div class="hat-label mb-2">WIDOK PŁASKI</div>
          <HatFlat 
          ref="flatRef" 
          :config="previewConfig"  :patternsDict="dictionaryData.patterns" 
          class="czapka2"
        />            
           
        </div>
    
        <div 
            id="print-front-container" 
            class="czapka front-layout"
            :class="{ 'is-active': activeView === 'front' }"
          >
          <div class="hat-label mb-2">WIDOK PRZÓD CZAPKI</div>
          <HatFront 
            ref="frontRef" 
            :config="previewConfig"  :show-pompon="previewConfig.pompons.show" 
            :patternsDict="dictionaryData.patterns" 
            class="czapka2"
          />            
          
        </div>

      </div>
    </template>

  </div>
</template>
<script setup>
  import { reactive, watch, onMounted, ref, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useGeneratorWizualizacji } from '../utils/generatorWizualizacji.js';
  import Formularz from './Formularz.vue';
  import TopBar from './TopBar.vue';
  import HatFlat from './hat/HatFlat.vue';
  import HatFront from './hat/HatFront.vue';
  import { defaultConfig, loadConfig, saveConfig } from '../utils/hatconfig.js';
  import { dictionaryAPI, projectAPI } from '../utils/axios.js';
  
  const isDownloading = ref(false);
  const isInitLoading = ref(true);
  const route = useRoute(); 
  const router = useRouter();
  
  // Refy do komponentów (Kluczowe dla PDF)
  const frontRef = ref(null);
  const flatRef = ref(null);
  
  const activeView = ref('front');
  const isBarExpanded = ref(false);
  const projectStatus = ref('NOWY');
  
  // Import generatora PDF
  const { generatePDF } = useGeneratorWizualizacji();

  const toggleView = () => {
    activeView.value = activeView.value === 'front' ? 'flat' : 'front';
  };
  
  // Reaktywny konfig
  const hatConfig = reactive(JSON.parse(JSON.stringify(defaultConfig)));
  
  // Słowniki
  const dictionaryData = ref({
    colors: [],
    patterns: [],
    fonts: []
  });
  
// hover
const hoverState = reactive({
  paths: [],  // np. 'base.top'
  value: null  // hex koloru
});
const previewConfig = computed(() => {
  const configCopy = JSON.parse(JSON.stringify(hatConfig));
  
  if (hoverState.paths.length > 0 && hoverState.value) {
    // Pętla po wszystkich ścieżkach, które chcemy podmienić
    hoverState.paths.forEach(p => {
      const keys = p.split('.');
      if (keys.length === 2 && configCopy[keys[0]]) {
        configCopy[keys[0]][keys[1]] = hoverState.value;
      }
    });
  }
  return configCopy;
});

const handleHover = (data) => {
  hoverState.paths = data.paths ? data.paths : [data.path];
  hoverState.value = data.value;
};

const handleHoverEnd = () => {
  hoverState.path = null;
  hoverState.value = null;
};
//hover


  // --- GŁÓWNA LOGIKA INICJALIZACJI ---
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
  
      if (route.params.id) {
        console.log("Tryb odczytu projektu: ", route.params.id);
        const response = await projectAPI.getProject(route.params.id);
        
        if (response.data.status) {
           projectStatus.value = response.data.status;
        }
  
        const savedConfig = response.data.config; 
        if (savedConfig) {
            Object.assign(hatConfig, savedConfig);
        } 
      } else {
        console.log("Tryb normalny - wczytuję z LocalStorage");
        const savedConfig = loadConfig();
        if (savedConfig) {
          Object.assign(hatConfig, savedConfig);
        }
        projectStatus.value = 'NOWY';
      }
  
    } catch (e) {
      console.error("Błąd krytyczny inicjalizacji:", e);
      alert("Nie udało się załadować projektu.");
      router.push('/');
    } finally {
      isInitLoading.value = false;
    }
  });
  
  watch(hatConfig, (newVal) => {
    updateCssVariables(newVal.base);
    if (!route.params.id) {
      saveConfig(newVal);
    }
  }, { deep: true });
  
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
  
  // --- PDF GENERATOR ---
  // Funkcja obsługująca przycisk z TopBar (stara)
  const handleDownloadRequest = async (type) => {
    if (type === "pdf") {
      handleDownload(); // Przekieruj do nowej funkcji
    }
  };
  
  // NOWA FUNKCJA GENERUJĄCA
  const handleDownload = async () => {
    // 1. Zbuduj obiekt danych projektu dynamicznie
    const projectData = {
      id: route.params.id || "Nowy",
      createdAt: new Date().toLocaleDateString(),
      config: hatConfig, // Używamy naszego reaktywnego obiektu
      status: projectStatus.value,
      client: { // Dodaj przykładowe dane klienta lub pobierz je skądś
         name: "Klient Indywidualny",
         email: "brak@danych.pl"
      }
    };
  
    // 2. Wywołaj generator (przekazując Refy)
    // Dodajemy prosty loader UI
    isDownloading.value = true;
    try {
       // Dajemy chwilę na przerysowanie UI
       setTimeout(async () => {
          await generatePDF(projectData, flatRef.value, frontRef.value);
          isDownloading.value = false;
       }, 100);
    } catch (e) {
       console.error("Błąd PDF:", e);
       alert("Wystąpił błąd podczas generowania PDF.");
       isDownloading.value = false;
    }
  };
  
  // Inicjalne ustawienie CSS
  updateCssVariables(hatConfig.base);
  </script>
  
  <style>


     @media print {
      .svg-wrapper {
        box-shadow: none !important;
        background: transparent !important;
        border: none !important;
      }
     }
  /* --- UKŁAD KONTENERÓW CZAPEK --- */
.flat-layout, 
.front-layout {
  /* To jest KLUCZOWE: ustawia dzieci (czapkę i napis) w pionie */
  flex-direction: column !important; 
  align-items: center; /* Centruje w poziomie */
  justify-content: center; /* Centruje w pionie (opcjonalnie) */
}

/* Jeśli wcześniej miałeś display: block na front-layout, zmień na flex dla spójności */
.front-layout {
  display: flex; 
  
}

/* --- STYL NAPISU --- */
.hat-label {
  margin-top: 15px; /* Odstęp od czapki */
  width: 100%;
  /* Wygląd */
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #6b7280; /* Szary kolor tekstu */
  
  /* Tło 'badge' (opcjonalne - jak wolisz sam tekst to usuń background i border) */
  background: rgba(255, 255, 255, 0.5);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid rgba(0,0,0,0.05);
}

/* --- POPRAWKA DLA MOBILE --- */
@media (max-width: 600px) {
  /* Upewniamy się, że na mobile też jest kolumna, gdy widoczny */
  .flat-layout.is-active,
  .front-layout.is-active {
    display: flex !important;
    flex-direction: column !important;
  }
}

  .flat-layout {
  display: flex;
  justify-content: center;
  align-items: flex-end; /* Opcjonalnie, jeśli potrzebujesz wyrównania do dołu */
}

  .front-layout {
    display: block;
  }
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
    width: 516px;
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
    transform: translateY(-3px);
    cursor: pointer;
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
  radial-gradient(at 10% 10%, rgba(var(--rgb-top), 0.22) 0px, transparent 50%),
  radial-gradient(at 90% 90%, rgba(var(--rgb-bottom), 0.22) 0px, transparent 50%);

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
  padding-top: 60px;     
}

.fade-in-content {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; } 
  to { opacity: 1; }
}

@media (max-width: 600px) {
  .flat-layout, 
  .front-layout {
    display: none !important;
  }

  .flat-layout.is-active {
    display: flex !important;
  }

  .front-layout.is-active {
    display: block !important;
  }
 .czapka2{
  width: 330px;
  padding-top:80px !important;
 }
 .content-layout {
   padding-top: 0px; 
   gap: 10px; 
   margin-bottom: 35px; 
   transition: margin-bottom 0.3s ease, transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
 }

 .content-layout.expanded-margin {
   margin-bottom: 110px;
 }
 .czapka2 .pompon{
  transform: scale(2.2) !important;
  right: 95px;
  top:20px !important;
 }

 .mobile-hidden {
    display: none !important;
  }
  
}


  </style>