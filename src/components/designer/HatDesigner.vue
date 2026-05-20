<template>
  <div class="svg-container no-scroll">

    <div v-if="isInitLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Wczytuję projekt...</p>
    </div>

    <template v-else>
      <ProductSidebar />


      <TopBar @download="handleDownloadRequest" :isDownloading="isDownloading" :hatConfig="hatConfig"
        :projectId="route.params.id || null" :currentStatus="projectStatus" :activeView="activeView"
        @toggle-view="toggleView" />

      <div class="fade-in-content content-layout" :class="{
        'shifted': isBarExpanded && !isDesktop,
        'expanded-margin': isBarExpanded && !isDesktop,
        'desktop-mode': isDesktop
      }">

        <div class="preview-panel">
          <div class="main-preview">
            <div id="print-flat-container" class="czapka flat-layout" :class="{ 'is-active': activeView === 'flat' }">
              <div class="hat-label mb-2">WIDOK PŁASKI</div>
              <HatFlat ref="flatRef" :config="previewConfig" :patternsDict="dictionaryData.patterns" class="czapka2" />
            </div>

            <div id="print-front-container" class="czapka front-layout" :class="{ 'is-active': activeView === 'front' }">
              <div class="hat-label mb-2">WIDOK PRZÓD CZAPKI</div>
              <HatFront ref="frontRef" :config="previewConfig" :show-pompon="previewConfig.pompons.show"
                :patternsDict="dictionaryData.patterns" class="czapka2" />
            </div>
          </div>

          <!-- Desktop Mini Thumbnail & View Switcher -->
          <div v-if="isDesktop" class="preview-footer">
            <div 
              class="mini-thumbnail" 
              :class="{ 
                'mini-thumbnail-front': activeView === 'flat', 
                'mini-thumbnail-flat': activeView === 'front' 
              }" 
              @click="toggleView"
            >
              <HatFlat v-if="activeView === 'front'" :config="previewConfig" :patternsDict="dictionaryData.patterns" />
              <HatFront v-else :config="previewConfig" :show-pompon="previewConfig.pompons.show" :patternsDict="dictionaryData.patterns" />
              <div class="mini-overlay">
                <span>{{ activeView === 'front' ? 'Widok Płaski' : 'Widok 3D' }}</span>
              </div>
            </div>
            
            <div class="view-switcher">
              <button :class="{ active: activeView === 'flat' }" @click="activeView = 'flat'">
                Płaski
              </button>
              <button :class="{ active: activeView === 'front' }" @click="activeView = 'front'">
                Frontalny
              </button>
            </div>
          </div>
        </div>

        <div class="config-panel" v-if="isDesktop">
          <ConfigBar :config="hatConfig" :dictionaries="dictionaryData" @update:config="handleConfigUpdate"
            @hover="handleHover" @hover-end="handleHoverEnd" :desktopMode="true" />
            
          <div class="config-panel-footer mt-5 mb-3 d-flex justify-content-center">
            <a href="/" class="bottom-logo-btn">
              <img v-if="hatConfig.customLogo" :src="hatConfig.customLogo" alt="Custom Logo" style="width: auto; max-width: 100%; max-height: 50px; object-fit: contain;" />
              <img v-else src="../../assets/Headwear_COLOR_CMYK_logo-1.png.webp" width="100" alt="hw" />
            </a>
          </div>
        </div>

        <ConfigBar v-if="!isDesktop" :config="hatConfig" :dictionaries="dictionaryData" @update:config="handleConfigUpdate"
          @toggle-expand="(val) => isBarExpanded = val" @hover="handleHover" @hover-end="handleHoverEnd" :desktopMode="false" />

      </div>
    </template>

  </div>
</template>
<script setup>
import { reactive, watch, onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGeneratorWizualizacji } from '../../utils/generatorWizualizacji.js';
import ConfigBar from './configBar/ConfigBar.vue';
import TopBar from './TopBar.vue';
import HatFlat from './hat/HatFlat.vue';
import HatFront from './hat/HatFront.vue';
import { defaultConfig, loadConfig, saveConfig } from '../../utils/hatconfig.js';
import { dictionaryAPI, projectAPI } from '../../utils/axios.js';
import ProductSidebar from '../ui/ProductSidebar.vue';

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

const handleConfigUpdate = (newConfig) => {
  Object.assign(hatConfig, newConfig);
};
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

  // Update isDesktop on resize
  window.addEventListener('resize', () => {
    isDesktop.value = window.innerWidth > 600;
  });
});

const isDesktop = ref(window.innerWidth > 600);

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

// --- JEDNA, POPRAWIONA FUNKCJA DO OBSŁUGI WYSYŁKI PDF ---
const handleDownloadRequest = async (eventData) => {
  // Sprawdzamy nasz nowy obiekt z formatem i e-mailem
  if (eventData && eventData.format === 'pdf') {
    isDownloading.value = true;
    
    try {
      // 1. Budujemy dane projektu
      const projectData = {
        id: route.params.id || "Nowy",
        createdAt: new Date().toLocaleDateString(),
        config: hatConfig,
        status: projectStatus.value
      };

      // Małe opóźnienie, żeby interfejs zdążył zareagować
      await new Promise(resolve => setTimeout(resolve, 100));

      // 2. Generujemy plik w pamięci (Blob) zamiast go pobierać
      const pdfBlob = await generatePDF(projectData, flatRef.value, frontRef.value);
      
      // 3. Pakujemy paczkę dla Spring Boota
      const formData = new FormData();
      formData.append('email', eventData.email); 
      
      // UWAGA: Upewniamy się, że projekt ma UUID.
      // Jeśli to nowy projekt (bez zapisu), dajemy domyślne zera, żeby Spring nie zwrócił błędu 400
      if (route.params.id) {
         formData.append('projectId', route.params.id);
      } else {
         formData.append('projectId', '00000000-0000-0000-0000-000000000000');
      }
      
      formData.append('file', pdfBlob, 'wizualizacja.pdf');

      // 4. Strzał do Twojego API
      await projectAPI.sendPdf(formData);
      
      alert("Wizualizacja została pomyślnie wysłana na adres: " + eventData.email);

    } catch (error) {
      console.error("Błąd podczas wysyłania PDF:", error);
      alert("Coś poszło nie tak. Upewnij się, że backend przyjmuje pliki.");
    } finally {
      isDownloading.value = false;
    }
  }
};

// --- PDF GENERATOR ---
// Funkcja obsługująca przycisk z TopBar (stara)
// const handleDownloadRequest = async (type) => {
//   if (type === "pdf") {
//     handleDownload(); // Przekieruj do nowej funkcji
//   }
// };
// Gdzieś w Twoim App.vue / Głównym komponencie:

// NOWA FUNKCJA GENERUJĄCA
// const handleDownload = async () => {
//   // 1. Zbuduj obiekt danych projektu dynamicznie
//   const projectData = {
//     id: route.params.id || "Nowy",
//     createdAt: new Date().toLocaleDateString(),
//     config: hatConfig, // Używamy naszego reaktywnego obiektu
//     status: projectStatus.value,
//     client: { // Dodaj przykładowe dane klienta lub pobierz je skądś
//       name: "Klient Indywidualny",
//       email: "brak@danych.pl"
//     }
//   };

//   // 2. Wywołaj generator (przekazując Refy)
//   // Dodajemy prosty loader UI
//   isDownloading.value = true;
//   try {
//     // Dajemy chwilę na przerysowanie UI
//     setTimeout(async () => {
//       await generatePDF(projectData, flatRef.value, frontRef.value);
//       isDownloading.value = false;
//     }, 100);
//   } catch (e) {
//     console.error("Błąd PDF:", e);
//     alert("Wystąpił błąd podczas generowania PDF.");
//     isDownloading.value = false;
//   }
// };

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
  align-items: center;
  /* Centruje w poziomie */
  justify-content: center;
  /* Centruje w pionie (opcjonalnie) */
}

/* Jeśli wcześniej miałeś display: block na front-layout, zmień na flex dla spójności */
.front-layout {
  display: flex;

}

/* --- STYL NAPISU --- */
.hat-label {
  margin: 15px auto 10px auto;
  width: 100%;
  max-width: 516px;
  box-sizing: border-box;
  text-align: center;
  /* Wygląd */
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #6b7280;
  /* Szary kolor tekstu */

  /* Tło 'badge' (opcjonalne - jak wolisz sam tekst to usuń background i border) */
  background: rgba(255, 255, 255, 0.7);
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

/* --- POPRAWKA DLA MOBILE --- */
@media (max-width: 600px) {

  /* Upewniamy się, że na mobile też jest kolumna, gdy widoczny */
  .flat-layout.is-active,
  .front-layout.is-active {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100%;
  }

  .hat-label {
    max-width: 310px;
  }
}

.flat-layout {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  /* Opcjonalnie, jeśli potrzebujesz wyrównania do dołu */
}

.front-layout {
  display: block;
}

.svg-container {
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  /* mobile padding below */
  padding-bottom: 0;
}

@media (max-width: 600px) {
  .svg-container {
    padding-bottom: 130px;
  }
}

/* ═══ DESKTOP LAYOUT STYLES ═══ */
.content-layout.desktop-mode {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100dvh;
  padding: 0;
  gap: 0;
  margin: 0;
}

.preview-panel {
  flex: 1;
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  justify-content: center;
  padding: 80px 40px 40px;
  overflow: hidden;
  height: 100%;
}

.main-preview {
  max-width: 650px;
  width: 100%;
  min-height: 440px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.main-preview .czapka {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
}

/* HIDE INACTIVE HATS IN DESKTOP MODE */
.content-layout.desktop-mode .flat-layout:not(.is-active),
.content-layout.desktop-mode .front-layout:not(.is-active) {
  display: none !important;
}

/* MINI THUMBNAIL */
.preview-footer {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  
}

.mini-thumbnail {
  width: 150px;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

}
.mini-thumbnail-front{
  height: 190px;
}
.mini-thumbnail-flat{
  height: 130px;
}

/* Override fixed styling inside the thumbnail */
.mini-thumbnail .svg-wrapper {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  padding: 0 !important;
  
  /* Preserve original dimensions so absolute children (pompon) don't break */
  width: 516px !important;
  height: 516px !important;
  min-width: 516px !important;
  
  /* Scale down the entire original layout to fit inside the 150x110 box */
  position: absolute !important;
  top: 45% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) scale(0.20) !important;
  transform-origin: center center !important;
  
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.mini-thumbnail .czapka2 {
  padding-top: 0 !important;
}

.mini-thumbnail svg {
  width: 100% !important;
  height: auto !important;
  transform: none !important;
}

.mini-thumbnail:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.9);
}
.mini-thumbnail .svg-wrapper .pompon{
  position: absolute !important;
  top: 0% !important;
  left: 32.5% !important;
  transform: translate(-50%, -50%) scale(3.6) !important;
  
}

.mini-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(4px);
  padding: 6px 0;
  text-align: center;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #4b5563;
  border-top: 1px solid rgba(0,0,0,0.05);
}

/* VIEW SWITCHER */
.view-switcher {
  display: flex;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 14px;
  padding: 4px;
  gap: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.view-switcher button {
  background: transparent;
  border: none;
  color: #6b7280;
  padding: 12px 36px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.view-switcher button:hover {
  background: rgba(255, 255, 255, 0.5);
  color: #374151;
}

.view-switcher button.active {
  background: #1f2937;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* CONFIG PANEL RIGHT */
.config-panel {
  width: 440px;
  min-width: 440px;
  height: 100dvh;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 100px 30px 40px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  border-left: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: -8px 0 40px rgba(0, 0, 0, 0.04);
  position: relative;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.bottom-logo-btn {
  background: rgba(255, 255, 255, 0.167);
  padding: 10px 10px;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.275);
}

.bottom-logo-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

/* Scrollbar styling for config panel */
.config-panel::-webkit-scrollbar {
  width: 6px;
}
.config-panel::-webkit-scrollbar-track {
  background: transparent;
}
.config-panel::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
.config-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

@media (max-width: 1024px) {
  .config-panel {
    width: 360px;
    min-width: 360px;
  }
}

.svg-wrapper {
  min-width: 300px;
  width: 530px;
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
.svg-wrapper .pompon{
  position: absolute;
  top: 0;
  left: 40px;
  transform: scale(3) !important;
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
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
  padding-top: 0px;
}

.fade-in-content {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
/* Czapka manipulacja rozmiaru */
@media (max-width: 1250px) {

  .preview-panel {
    flex-direction: column;
  }
  .svg-wrapper {
  width: 420px;

  }
  .svg-wrapper .pompon{
    position: absolute;
    top: 0;
    left: -7px;
    transform: scale(2.7) !important;
  }
}

@media (max-width: 600px) {
  .svg-container {
    padding-bottom: 120px;
  }

  .preview-panel {
    padding: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .main-preview {
    min-height: auto;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .czapka2 {
    margin: 0 auto;
  }

  .preview-footer {
    display: none !important;
  }

  .svg-wrapper:hover {
    transform: translateY(0px);
    cursor: pointer;
    background: rgba(255, 255, 255, 0.75);
    box-shadow:
      0 12px 30px -8px rgba(0, 0, 0, 0.1),
      inset 0 1px 2px rgba(255, 255, 255, 1);
    border-color: rgba(255, 255, 255, 0.8);
  }

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

  .czapka2 {
    width: 310px;
    padding-top: 80px !important;
  }

  .content-layout {
    padding-top: 0px;
    gap: 10px;
    margin-bottom: 60px;
    transition: transform 0.3s ease;
  }


  .czapka2 .pompon {
    transform: scale(2.2) !important;
    right: 86px;
    top: 20px !important;
  }

  .mobile-hidden {
    display: none !important;
  }

}
</style>