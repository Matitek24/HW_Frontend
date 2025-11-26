<template>
  <div class="top-header">
    
    <div class="model-tag-container">
      <div class="tag-ribbon">
        <span class="tag-label">MODEL</span>
        <span class="tag-value">#HEADWEAR</span>
      </div>
    </div>

    <div class="d-flex justify-content-center">
      
      <button 
        class="glass-btn with-text me-3" 
        :class="{ 'disabled-btn': isDownloading }"
        :disabled="isDownloading"
        @click="$emit('download', 'pdf')"
      >
        <span class="btn-text">
          {{ isDownloading ? 'Pobieram...' : 'Pobierz wizualizację' }}
        </span>
        
        <span class="btn-icon">
          <svg v-if="!isDownloading" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <svg v-else class="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
        </span>
      </button>

      <button 
        class="glass-btn with-text" 
        @click="handleMainAction"
        :class="{ 'disabled-btn': !canEdit || isSubmitting }"
        :disabled="!canEdit || isSubmitting"
      >
        <span class="btn-text">
           {{ isSubmitting ? 'Przetwarzanie...' : buttonText }}
        </span>
        
        <span class="btn-icon">
          <svg v-if="isSubmitting" class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
          
          <svg v-else-if="!canEdit" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          
          <svg v-else-if="isEditMode" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </span>
      </button>

    </div>
    <div class="actions-container">
    

      <a href="/" class="logo-btn">
          <img src="../assets/Headwear_COLOR_CMYK_logo-1.png.webp" width="120" alt="hw" />
      </a>

    </div>
  </div>

  <Transition name="fade">
    <div v-show="isModalOpen" class="modal-overlay" @click.self="closeModal">
      
      <div class="glass-modal-content container p-4">
        <div class="position-relative text-center py-4">
            <button class="btn position-absolute top-0 end-0 m-3" @click="closeModal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1f2937"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <h3 class="modal-title">Wyślij zapytanie</h3>
            <p class="modal-subtitle">Otrzymaj wycenę dla Twojej konfiguracji</p>
        </div>


        <form @submit.prevent="submitForm" class="row g-3">
          <div class="col-12">
            <label class="form-label">Imię i Nazwisko / Firma</label>
            <input type="text" v-model="formData.imieNazwisko" class="input-pill w-100" placeholder="Wpisz nazwę..." required>
          </div>

          <div class="col-md-4">
            <label class="form-label">E-mail</label>
            <input type="email" v-model="formData.email" class="input-pill w-100" placeholder="twoj@email.com" required>
          </div>
          <div class="col-md-4">
            <label class="form-label">Numer telefonu</label>
            <input type="tel" v-model="formData.telefon" class="input-pill w-100" placeholder="+48 000 000 000">
          </div>
          <div class="col-md-4">
            <label class="form-label">Ilośc czapek</label>
            <input type="number" v-model="formData.ilosc" class="input-pill w-100" placeholder="100">
          </div>

          <div class="col-12">
            <label class="form-label">Uwagi do zamówienia</label>
            <textarea v-model="formData.uwagi" class="input-pill w-100" rows="4" placeholder="Dodatkowe informacje o hafcie, terminie itp."></textarea>
          </div>

          <div class="col-12 mt-2">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="rodoCheck" v-model="formData.rodo" required>
              <label class="form-check-label small text-muted d-flex ms-2 mt-4 fw-lighter" for="rodoCheck">
                Akceptuję politykę prywatności i przetwarzanie danych w celu wyceny.
              </label>
            </div>
          </div>

          <div class="col-12 mt-4 d-flex justify-content-end gap-3">
            <button type="button" class="glass-btn secondary" @click="closeModal">Anuluj</button>
            <button type="submit" class="action-btn-primary" :disabled="isSubmitting">
              <template v-if="!isSubmitting">
                Wyślij zapytanie
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ms-2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </template>
              <span v-else>Wysyłanie...</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  </Transition>

  
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { projectAPI } from '../utils/axios.js'; 

const props = defineProps({
  isDownloading: { type: Boolean, default: false },
  hatConfig: { type: Object, required: true },
  
  // ID projektu i Status (z rodzica)
  projectId: { type: [String, null], default: null },
  currentStatus: { type: String, default: 'NOWY' }
});

const emit = defineEmits(['download']);

// Stan UI
const isModalOpen = ref(false);
const isSubmitting = ref(false);

// Dane do formularza (tylko dla nowego projektu)
const formData = reactive({
  imieNazwisko: '',
  email: '',
  telefon: '',
  firma: '', 
  ilosc: '',
  uwagi: '',
  rodo: false
});

// --- LOGIKA STANU (COMPUTED) ---

// 1. Czy edytujemy istniejący projekt?
const isEditMode = computed(() => !!props.projectId);

// 2. Czy można edytować? (Tylko jeśli to nowy projekt LUB status w bazie to 'NOWY')
const canEdit = computed(() => {
  if (!isEditMode.value) return true; // Nowy zawsze można
  return props.currentStatus === 'NOWY';
});

// 3. Tekst na guziku
const buttonText = computed(() => {
  if (!isEditMode.value) return 'Wyślij wizualizację';
  return canEdit.value ? 'Zapisz Wersję' : `Status: ${props.currentStatus}`;
});

// --- GŁÓWNA AKCJA PRZYCISKU ---
const handleMainAction = () => {
  if (!canEdit.value) return; // Zabezpieczenie

  if (isEditMode.value) {
    // Tryb edycji -> Szybki zapis (PUT)
    submitUpdateDirectly();
  } else {
    // Tryb nowy -> Otwórz modal (POST)
    isModalOpen.value = true;
  }
};

// --- LOGIKA MODALA ---
const closeModal = () => {
  isModalOpen.value = false;
};

// --- SCENARIUSZ 1: NOWY PROJEKT (POST) ---
const submitNewProject = async () => {
  if (!formData.rodo) {
    alert("Musisz zaakceptować zgodę RODO.");
    return;
  }

  isSubmitting.value = true;

  try {
    const payload = {
      imieNazwisko: formData.imieNazwisko,
      email: formData.email,
      telefon: formData.telefon,
      firma: formData.firma,
      ilosc: parseInt(formData.ilosc) || 0,
      uwagi: formData.uwagi,
      zgodaRodo: formData.rodo,
      config: props.hatConfig 
    };

    await projectAPI.submitProject(payload);

    alert('Dziękujemy! Twoje zapytanie zostało wysłane.');
    closeModal();
    
    // Reset formularza
    formData.uwagi = '';
    formData.rodo = false;
    // Tutaj opcjonalnie można przekierować usera na widok edycji, ale na razie zostawiamy

  } catch (error) {
    console.error(error);
    alert('Wystąpił błąd podczas wysyłania.');
  } finally {
    isSubmitting.value = false;
  }
};

// --- SCENARIUSZ 2: AKTUALIZACJA (PUT) ---
const submitUpdateDirectly = async () => {
  if (!confirm("Czy chcesz nadpisać zapisaną konfigurację nową wersją?")) return;

  isSubmitting.value = true;

  try {
    // Wysyłamy tylko konfigurację (backend i tak ignoruje dane osobowe przy update)
    const payload = {
       config: props.hatConfig
    };

    await projectAPI.updateProject(props.projectId, payload);
    alert('Zapisano nową wersję projektu!');
    
  } catch (error) {
    console.error(error);
    if (error.response && (error.response.status === 403 || error.response.status === 401)) {
        alert("Nie można zapisać zmian. Projekt został zablokowany przez administratora.");
    } else {
        alert('Błąd zapisu.');
    }
  } finally {
    isSubmitting.value = false;
  }
};

// Funkcja wywoływana przez formularz w modalu
const submitForm = () => {
  submitNewProject();
};
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
/* --- GŁÓWNY LAYOUT NAGŁÓWKA --- */
.top-header {
  position: fixed;
  top: 0; left: 0; right: 0;
  padding: 30px 34px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 200; /* Wyższy index niż dolny bar */
  pointer-events: none;
}

.top-header > * {
  pointer-events: auto;
}

/* --- METKA (Z Twojego kodu) --- */
.model-tag-container { filter: drop-shadow(0 4px 6px rgba(0,0,0,0.08)); }
.tag-ribbon {
  background: #fff;
  border-radius: 0 0 12px 12px;
  padding: 12px 16px;
  display: flex; flex-direction: column;
  border-top: 4px solid #1f293798;
}
.tag-label { font-size: 9px; color: #9ca3af; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
.tag-value { font-family: 'Courier New', monospace; font-size: 16px; font-weight: 700; color: #1f2937; }

/* --- KONTENER AKCJI (Prawa strona) --- */
.actions-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* --- STYLIZACJA PRZYCISKÓW GLASSMORPHISM --- */
.glass-btn {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 50px;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  color: #1f2937;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px; /* Stała wysokość */
}

.glass-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

/* Przycisk "Tylko ikona" (Pobierz) */
.glass-btn.icon-only {
  width: 48px;
  border-radius: 50%;
}

/* Przycisk z tekstem (Wyślij) */
.glass-btn.with-text {
  padding: 0 20px 0 24px;
  gap: 10px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
}

.glass-btn.secondary {
  border-radius: 12px;
  height: 44px;
  padding: 0 24px;
  font-size: 14px;
}

/* Logo Button (lekko zmniejszony względem oryginału, żeby pasował do guzików) */
.logo-btn {
  background: rgba(255, 255, 255, 0.9);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: none;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  margin-left: 8px;
}

/* --- BUTTON "Primary" w formularzu --- */
.action-btn-primary {
  background: #1f2937; /* Ciemny kolor z Twojego designu */
  color: white;
  border: none;
  border-radius: 12px;
  padding: 10px 28px;
  font-weight: 600;
  font-size: 14px;
  display: flex; align-items: center;
  transition: background 0.2s;
}
.action-btn-primary:hover { background: #000; }

/* --- MODAL STYLES --- */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.4); /* Przyciemnienie tła */
  backdrop-filter: blur(4px); /* Rozmycie tła pod modalem */
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.glass-modal-content {
  background: rgba(255, 255, 255, 0.85); /* Półprzezroczyste białe */
  backdrop-filter: blur(20px); /* Mocny blur w samym oknie */
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  width: 100%;
  max-width: 600px;
  box-shadow: 
    0 20px 50px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  animation: slideUp 0.3s ease-out;
}

.modal-title { font-family: 'Inter', sans-serif; font-weight: 700; font-size: 22px; color: #111; margin: 0; }
.modal-subtitle { font-size: 13px; color: #6b7280; margin-top: 4px; }

/* INPUTY (Pills - skopiowane z Twojego kodu dla spójności) */
.form-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
  margin-bottom: 6px;
  margin-left: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-pill {
  background: #f3f4f6; /* Jasne tło inputa */
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 10px 16px;
  font-size: 14px;
  color: #1f2937;
  outline: none;
  transition: all 0.2s ease;
}
.input-pill:focus {
  background: #ffffff;
  border-color: #569abf; /* Kolor akcentu z metki */
  box-shadow: 0 0 0 4px rgba(86, 154, 191, 0.1);
}

.close-btn {
  background: transparent; border: none; cursor: pointer; opacity: 0.6; transition: opacity 0.2s;
}
.close-btn:hover { opacity: 1; }

/* ANIMACJE */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* RWD */
@media (max-width: 576px) {
  .glass-modal-content { width: 95%; padding: 20px !important; }
  .actions-container { gap: 8px; }
  .glass-btn.with-text .btn-text { display: none; } /* Na mobilu ukryj tekst "Wyślij", zostaw ikonę */
  .glass-btn.with-text { padding: 0; width: 48px; border-radius: 50%; justify-content: center; }
  .logo-btn { width: 60px; height: 60px; }
  .logo-btn img { width: 50px; }
}

.disabled-btn {
  opacity: 0.6;
  cursor: not-allowed;
  background: rgba(229, 231, 235, 0.8); /* Szary */
  border-color: #d1d5db;
  color: #9ca3af;
}
.disabled-btn:hover {
  transform: none;
  box-shadow: none;
  background: rgba(229, 231, 235, 0.8);
}
</style>