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
          <svg v-if="!isDownloading" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <svg v-else class="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
          </svg>
        </span>
      </button>

      <button class="glass-btn with-text" @click="openModal">
        <span class="btn-text">Wyślij wizualizację</span>
        <span class="btn-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </span>
      </button>
    </div>
    <div class="actions-container">
    

      <button class="logo-btn">
        <img src="../assets/Headwear_COLOR_CMYK_logo-1.png.webp" width="120" alt="hw">
      </button>
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
            <input type="text" class="input-pill w-100" placeholder="Wpisz nazwę..." required>
          </div>

          <div class="col-md-4">
            <label class="form-label">E-mail</label>
            <input type="email" class="input-pill w-100" placeholder="twoj@email.com" required>
          </div>
          <div class="col-md-4">
            <label class="form-label">Numer telefonu</label>
            <input type="tel" class="input-pill w-100" placeholder="+48 000 000 000">
          </div>
          <div class="col-md-4">
            <label class="form-label">Ilośc czapek</label>
            <input type="number" class="input-pill w-100" placeholder="100">
          </div>


          <div class="col-12">
            <label class="form-label">Uwagi do zamówienia</label>
            <textarea class="input-pill w-100" rows="4" placeholder="Dodatkowe informacje o hafcie, terminie itp."></textarea>
          </div>

          <div class="col-12 mt-2">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="rodoCheck" required>
              <label class="form-check-label small text-muted d-flex ms-2 mt-4 fw-lighter" for="rodoCheck">
                Akceptuję politykę prywatności i przetwarzanie danych w celu wyceny.
              </label>
            </div>
          </div>

          <div class="col-12 mt-4 d-flex justify-content-end gap-3">
            <button type="button" class="glass-btn secondary" @click="closeModal">Anuluj</button>
            <button type="submit" class="action-btn-primary">
              Wyślij zapytanie
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ms-2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </form>

      </div>
    </div>
  </Transition>

  
</template>

<script setup>
import { ref } from 'vue';


defineProps({
  isDownloading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['download']);

const isModalOpen = ref(false);

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const submitForm = () => {
  // Tutaj logika wysyłania (np. axios.post)
  alert('Formularz został wysłany! (Demo)');
  closeModal();
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
</style>