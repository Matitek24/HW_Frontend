<template>
    <div class="ai-assistant-wrapper">
      <button class="ai-fab" @click="toggleOpen" :class="{ 'is-active': isOpen }" title="Asystent AI">
        <svg v-if="!isOpen" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="ai-icon">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" style="display:none;"/>
          <path fill-rule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clip-rule="evenodd" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="ai-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
  
      <transition name="ai-fade">
        <div v-if="isOpen" class="ai-panel">
          <div class="ai-header">
            <h4>Magiczny Asystent</h4>
          </div>
          
          <div class="ai-body">
            <p class="ai-desc">Opisz czapkę, a AI ustawi wszystko za Ciebie!</p>
            <textarea
              v-model="prompt"
              placeholder="np. Zrób mi czapkę w morskim klimacie. Dół błękitny, środek granatowy..."
              rows="3"
              :disabled="isLoading"
            ></textarea>
        
            <button class="ai-submit-btn" @click="generateHat" :disabled="isLoading || !prompt.trim()">
              <span v-if="isLoading">
                <span class="spinner-mini"></span> Generowanie...
              </span>
              <span v-else>Zaprojektuj czapkę</span>
            </button>
        
            <p v-if="errorMsg" class="ai-error">{{ errorMsg }}</p>
          </div>
        </div>
      </transition>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const isOpen = ref(false);
  const prompt = ref('');
  const isLoading = ref(false);
  const errorMsg = ref('');
  
  const emit = defineEmits(['config-ready']);
  
  const toggleOpen = () => {
    isOpen.value = !isOpen.value;
    if (!isOpen.value) {
      errorMsg.value = ''; // czyszczenie błędów przy zamknięciu
    }
  };
  
  const generateHat = async () => {
    isLoading.value = true;
    errorMsg.value = '';
  
    try {
      const response = await fetch('http://localhost:8080/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.value })
      });
  
      if (!response.ok) {
        if (response.status === 429) throw new Error("Zbyt wiele zapytań! AI musi odpocząć.");
        throw new Error("Błąd serwera. Sprawdź konsole.");
      }
  
      const newConfig = await response.json();
      emit('config-ready', newConfig);
      
      // Opcjonalnie: Zamknij panel po udanym wygenerowaniu
      // isOpen.value = false;
  
    } catch (error) {
      console.error("Błąd połączenia z AI:", error);
      errorMsg.value = error.message;
    } finally {
      isLoading.value = false;
    }
  };
  </script>
  
  <style scoped>
  .ai-assistant-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  
  /* --- Przycisk Pływający (FAB) --- */
  .ai-fab {
    width: 54px;
    height: 54px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
    border: none;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(108, 92, 231, 0.4);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    z-index: 10;
  }
  
  .ai-fab:hover {
    transform: scale(1.05) translateY(-2px);
    box-shadow: 0 6px 20px rgba(108, 92, 231, 0.5);
  }
  
  .ai-fab.is-active {
    background: #fff;
    color: #6c5ce7;
    border: 1px solid rgba(108, 92, 231, 0.2);
  }
  
  .ai-icon {
    width: 26px;
    height: 26px;
  }
  
  /* --- Panel AI (Szklany design) --- */
  .ai-panel {
  position: absolute;  /* KLUCZ: panel nie wpływa na układ innych elementów */
  top: 64px;          /* 54px wysokości guzika + 10px odstępu */
  left: 0;            /* Wyrównanie do lewej krawędzi kontenera */
  width: 320px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  z-index: 5;
}
  .ai-header {
    padding: 15px 20px;
    background: rgba(108, 92, 231, 0.05);
    border-bottom: 1px solid rgba(0, 0, 0, 0.03);
  }
  
  .ai-header h4 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: #2d3436;
  }
  
  .ai-body {
    padding: 20px;
  }
  
  .ai-desc {
    font-size: 13px;
    color: #636e72;
    margin-top: 0;
    margin-bottom: 12px;
  }
  
  textarea {
    width: 100%;
    padding: 12px;
    color:black;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    margin-bottom: 15px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    resize: none;
    background: rgba(255, 255, 255, 0.9);
    transition: border-color 0.3s;
    box-sizing: border-box;
  }
  
  textarea:focus {
    outline: none;
    border-color: #6c5ce7;
  }
  
  .ai-submit-btn {
    width: 100%;
    padding: 12px;
    background-color: #6c5ce7;
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .ai-submit-btn:hover:not(:disabled) {
    background-color: #5b4bc4;
  }
  
  .ai-submit-btn:disabled {
    background-color: #c8c2f8;
    cursor: not-allowed;
  }
  
  .ai-error {
    color: #d63031;
    font-size: 12px;
    margin-top: 10px;
    margin-bottom: 0;
    text-align: center;
  }
  
  /* Spinner ładowania */
  .spinner-mini {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    100% { transform: rotate(360deg); }
  }
  
  /* --- Animacja rozwijania --- */
  .ai-fade-enter-active,
  .ai-fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
    transform-origin: top left;
  }
  
  .ai-fade-enter-from,
  .ai-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  </style>