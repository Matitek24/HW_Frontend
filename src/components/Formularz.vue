<template>
  <div class="config-bar-container" :class="{ 'expanded': isExpanded }">
    
    <div class="toggle-wrapper" @click="toggleExpand">
      <div class="toggle-btn">
        <span class="chevron" :class="{ 'up': !isExpanded, 'down': isExpanded }"></span>
      </div>
    </div>

    <div class="config-bar">
      
      <div v-show="!isExpanded" class="view-compact">
        
        <div class="group-section">
          <div class="group-header"><span class="icon"></span> Personalizacja</div>
          <div class="controls-row">
            <input 
              type="text" 
              v-model="config.text.content" 
              class="input-pill text-main"
              placeholder="Twój tekst..."
            />
            <div class="select-wrapper">
              <select v-model="config.text.font" class="input-pill select-pill">
                <option 
                  v-for="font in dictionaries.fonts" 
                  :key="font.id" 
                  :value="font.wartosc"
                >
                  {{ font.nazwa }}
                </option>
              </select>
            </div>
            <div class="color-pill">
              <ColorPicker
                v-model="config.text.color"
                :color-options="dictionaries.colors"
                title="Kolor tekstu"
              />
              <input type="text" v-model="config.text.color" class="hex-input" maxlength="7" />
            </div>
          </div>
        </div>
  
        <div class="vertical-divider"></div>
  
        <div class="group-section">
          <div class="group-header">Kolory Czapki</div>
          <div class="controls-row compact-gap">
            <div class="mini-color-stack" title="Góra">
              <ColorPicker
                v-model="config.base.top"
                :color-options="dictionaries.colors"
                title="Góra czapki"
              />
            </div>
            <div class="mini-color-stack" title="Środek">
              <ColorPicker
                v-model="config.base.middle"
                :color-options="dictionaries.colors"
                title="Środek czapki"
              />
            </div>
            <div class="mini-color-stack" title="Dół">
              <ColorPicker
                v-model="config.base.bottom"
                :color-options="dictionaries.colors"
                title="Dół czapki"
              />
            </div>
          </div>
        </div>

        <div class="vertical-divider"></div>

        <div class="group-section">
          <div class="group-header">Wzory</div>
          <div class="controls-row compact-gap">
            <div class="mini-color-stack" title="Wzór Główny">
              <ColorPicker
                v-model="config.pattern.top"
                :color-options="dictionaries.colors"
                title="Kolor wzoru góra"
              />
            </div>
            <div class="select-wrapper">
              <div class="select-wrapper w-100"> <PatternPicker 
                  v-model="config.patterns.top" 
                  :options="topPatterns" 
                  title="Wybierz wzór (Góra)"
                />
              </div>
            </div>
          </div>
          <div class="controls-row compact-gap">
            <div class="mini-color-stack" title="Wzór Główny">
              <ColorPicker
                v-model="config.pattern.main"
                :color-options="dictionaries.colors"
                title="Kolor wzoru dół"
              />
            </div>
            <div class="select-wrapper">
              <div class="select-wrapper w-100"> <PatternPicker 
                  v-model="config.patterns.bottom" 
                  :options="bottomPatterns" 
                  title="Wybierz wzór (Góra)"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="vertical-divider"></div>
  
        <div class="group-section">
          <div class="group-header">Pompony</div>
          <div class="pompon-carousel">
            <div class="color-pill compact">
              <ColorPicker
                v-model="config.pompons.p1"
                :color-options="dictionaries.colors"
                title="Pompon 1"
              />
              <ColorPicker
                v-model="config.pompons.p2"
                :color-options="dictionaries.colors"
                title="Pompon 2"
              />
              <ColorPicker
                v-model="config.pompons.p3"
                :color-options="dictionaries.colors"
                title="Pompon 3"
              />
              <ColorPicker
                v-model="config.pompons.p4"
                :color-options="dictionaries.colors"
                title="Pompon 4"
              />
            </div>
          </div>
        </div>

      </div>

      <div v-show="isExpanded" class="view-expanded">
        
        <div class="expanded-grid">
          
          <div class="expanded-column">
            <h3 class="column-title">Napis</h3>
            
            <div class="expanded-field">
              <input 
                type="text" 
                v-model="config.text.content" 
                class="input-pill full-width large-text"
                placeholder="Twój tekst..."
              />
            </div>

            <div class="expanded-row">
              <div class="expanded-field half">
                <label>Czcionka</label>
                <div class="select-wrapper">
                  <select v-model="config.text.font" class="input-pill select-pill full-width">
                    <option 
                      v-for="font in dictionaries.fonts" 
                      :key="font.id" 
                      :value="font.wartosc"
                    >
                      {{ font.nazwa }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="expanded-field half">
                <label>Kolor</label>
                <div class="color-pill full-width space-between">
                  <ColorPicker
                    v-model="config.text.color"
                    :color-options="dictionaries.colors"
                  />
                  <span class="hex-display">{{ config.text.color }}</span>
                </div>
              </div>
            </div>
            
            <div class="expanded-row">
              <div class="expanded-field half">
                <label>Rozmiar: {{ config.text.fontSize }}</label>
                <input 
                  type="range" 
                  v-model.number="config.text.fontSize" 
                  min="30" max="200" step="5"
                  class="slider compact-slider"
                />
              </div>
              <div class="expanded-field half">
                <label>Pozycja Y: {{ config.text.offsetY || 0 }}</label>
                <input 
                  type="range" 
                  v-model.number="config.text.offsetY" 
                  min="-60" max="60" step="2"
                  class="slider compact-slider"
                />
              </div>
            </div>
          </div>

          <div class="expanded-column">
            <h3 class="column-title">Kolory Bazy</h3>
            <div class="color-list-rows">
              <div class="color-row-item">
                <span class="label-text">Góra</span>
                <ColorPicker
                  v-model="config.base.top"
                  :color-options="dictionaries.colors"
                />
              </div>
              <div class="color-row-item">
                <span class="label-text">Środek</span>
                <ColorPicker
                  v-model="config.base.middle"
                  :color-options="dictionaries.colors"
                />
              </div>
              <div class="color-row-item">
                <span class="label-text">Dół</span>
                <ColorPicker
                  v-model="config.base.bottom"
                  :color-options="dictionaries.colors"
                />
              </div>
            </div>
          </div>

          <div class="expanded-column">
            <h3 class="column-title">Wzory</h3>
            
            <div class="expanded-row">
              <div class="expanded-field grow">
                <label>Wzór Góra</label>
                <div class="select-wrapper">
                  <select v-model="config.patterns.top" class="input-pill select-pill full-width">
                    <option :value="null">Brak</option> 
                    <option v-for="p in topPatterns" :key="p.id" :value="p.id">{{ p.nazwa }}</option>
                  </select>
                </div>
              </div>
              <div class="expanded-field auto-width">
                <label>Kolor</label>
                <div class="color-pill justify-center">
                  <ColorPicker v-model="config.pattern.top" :color-options="dictionaries.colors" />
                </div>
              </div>
            </div>

            <div class="expanded-row mt-2">
              <div class="expanded-field grow">
                <label>Wzór Dół</label>
                <div class="select-wrapper">
                  <select v-model="config.patterns.bottom" class="input-pill select-pill full-width">
                    <option :value="null">Brak</option> 
                    <option v-for="p in bottomPatterns" :key="p.id" :value="p.id">{{ p.nazwa }}</option>
                  </select>
                </div>
              </div>
              <div class="expanded-field auto-width">
                <label>Kolor</label>
                <div class="color-pill justify-center">
                  <ColorPicker v-model="config.pattern.main" :color-options="dictionaries.colors" />
                </div>
              </div>
            </div>
          </div>

          <div class="expanded-column">
            <h3 class="column-title">Pompony</h3>
            <div class="pompon-grid-display">
               <div class="pompon-item">
                 <label>P 1</label>
                 <ColorPicker v-model="config.pompons.p1" :color-options="dictionaries.colors" />
               </div>
               <div class="pompon-item">
                 <label>P 2</label>
                 <ColorPicker v-model="config.pompons.p2" :color-options="dictionaries.colors" />
               </div>
               <div class="pompon-item">
                 <label>P 3</label>
                 <ColorPicker v-model="config.pompons.p3" :color-options="dictionaries.colors" />
               </div>
               <div class="pompon-item">
                 <label>P 4</label>
                 <ColorPicker v-model="config.pompons.p4" :color-options="dictionaries.colors" />
               </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import ColorPicker from '../components/utils/ColorPicker.vue'; 
import PatternPicker from '../components/utils/PatternPicker.vue'; 

const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  dictionaries: {
    type: Object,
    default: () => ({
      colors: [],
      patterns: [],
      fonts: []
    })
  }
});

const isExpanded = ref(false);

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const topPatterns = computed(() => 
  props.dictionaries.patterns.filter(p => p.kategoria === 'TOP')
);

const bottomPatterns = computed(() => 
  props.dictionaries.patterns.filter(p => p.kategoria === 'BOTTOM')
);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
.expanded-column {
  display: flex;
  flex-direction: column;
  position: relative; /* Kluczowe dla umieszczenia kreski */
  padding-right: 20px;
  padding-left: 20px;
}


.expanded-column:not(:last-child)::after {
  content: '';
  position: absolute;
  right: -12px;      
  top: 15px;         
  bottom: 5px;       
  width: 1px;         
  background: #e5e7eb;
}

@media (max-width: 1024px) {
  .expanded-column::after {
    display: none;
  }
}

.slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e0e0e0;
  outline: none;
  transition: background 0.3s;
}

.slider:hover {
  background: #d0d0d0;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #303030;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.slider::-webkit-slider-thumb:hover {
  background: #484848;
  transform: scale(1.1);
  box-shadow: 0 3px 8px rgba(0,0,0,0.3);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.slider::-moz-range-thumb:hover {
  background: #5568d3;
  transform: scale(1.2);
  box-shadow: 0 3px 8px rgba(0,0,0,0.3);
}

.expanded-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 0.8fr; 
  gap: 24px;
}

.compact-slider {
  width: 100%;
  margin-top: 4px;
}


.pompon-grid-display {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.pompon-item {
  background: #f9fafb;
  border-radius: 12px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.pompon-item label {
  font-size: 10px;
  color: #9ca3af;
  font-weight: 700;
}

/* Pomocnicze klasy do układu wzorów */
.expanded-row { display: flex; gap: 10px; align-items: flex-end;}
.grow { flex-grow: 1; }
.auto-width { width: auto; flex-shrink: 0; }
.mt-2 { margin-top: 12px; }

/* RWD - na tablecie wracamy do 2 kolumn, bo 4 się nie zmieszczą */
@media (max-width: 1024px) {
  .expanded-grid {
    grid-template-columns: 1fr 1fr;
    gap: 30px;
  }
}

@media (max-width: 768px) {
  .expanded-grid {
    grid-template-columns: 1fr;
  }
}
.color-picker-wrapper {
  position: relative;
}

.color-ring.clickable {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.color-ring.clickable:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}

.color-dropdown {
  position: absolute;
  bottom: calc(100% + 8px); 
  right: 0;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
  padding: 12px;
  z-index: 200000;
  min-width: 240px;
}

.color-dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #f3f4f6;
}

.color-dropdown-header span {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.color-dropdown-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.color-dropdown-swatch {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  border: 2px solid transparent;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  transition: all 0.2s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-dropdown-swatch:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 10;
}

.color-dropdown-swatch.active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.checkmark {
  color: white;
  font-size: 18px;
  font-weight: bold;
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.slide-fade-enter-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter-from {
  transform: translateY(10px) scale(0.95);  /* zmienione z -10px na 10px */
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(5px);  /* zmienione z -5px na 5px */
  opacity: 0;
}

/* Usuń stare elementy */
.db-color-palette { display: none; }
.color-ring input[type="color"] { display: none; }

@media (max-width: 768px) {
  .color-dropdown {
    right: auto;
    left: 50%;
    transform: translateX(-50%);
  }
  .color-dropdown-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}


/* --- KONTENER GŁÓWNY --- */
.config-bar-container {
  position: fixed;
  bottom: 30px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 0 20px;
  z-index: 100;
  font-family: 'Inter', sans-serif;
  transition: all 0.5s ease-in-out;
}

/* Zmiana layoutu po rozwinięciu */
.config-bar-container.expanded {
  bottom: 0;
  padding: 0;
  height: auto;
  align-items: flex-end;
}

.toggle-wrapper {
  position: absolute;
  top: -40px; 
  left: 0; 
  right: 0;
  display: flex;
  justify-content: center;
  z-index: -1;
  pointer-events: none; /* Żeby kliknięcie obok nie łapało */
}

.toggle-btn {
  pointer-events: auto;
  width: 64px;
  height: 45px;
  background: #ffffff;
  border-top-left-radius: 40px;
  border-top-right-radius: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 -4px 15px rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.03);
  border-bottom: none;
}

.chevron {
  border: solid #252525;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  transition: transform 0.3s;
}
.chevron.up { transform: rotate(-135deg) translateY(-2px); }
.chevron.down { transform: rotate(45deg) translateY(-2px); }


/* --- BELKA WŁAŚCIWA --- */
.config-bar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  padding: 12px 24px;
  border-radius: 24px;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(0, 0, 0, 0.03);
  
  max-width: 100%;
  
}

.config-bar-container.expanded .config-bar {
  width: 100%;
  max-width: 1200px; 
  padding: 20px 30px; 
  margin: 0 auto;
  border-radius: 24px 24px 0 0;
}

/* --- STYLE WSPÓLNE (PILLS, COLORS) --- */
/* To zachowujemy z Twojego oryginału, bo jest super */

.group-section { display: flex; flex-direction: column; gap: 6px; }
.group-header { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; font-weight: 700; display: flex; align-items: center; gap: 4px;}
.controls-row { display: flex; align-items: center; gap: 10px; }
.controls-row.compact-gap { gap: 8px; }
.vertical-divider { width: 1px; height: 40px; background: #e5e7eb; margin: 0 4px; }

.input-pill {
  background: #f3f4f6;
  border: 2px solid transparent;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 14px;
  color: #1f2937;
  outline: none;
  transition: all 0.2s ease;
}
.select-pill{
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: #f3f4f6;
  border: 2px solid transparent;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 14px;
  color: #1f2937;
  outline: none;
  transition: all 0.2s ease;
}

.input-pill:focus { background: #ffffff; border-color: #3b82f6; }
.text-main { width: 140px; font-weight: 500; }
.select-pill { cursor: pointer; padding-right: 24px; }
.select-pill.short { width: auto; width: 100px; }

.color-pill {
  background: #f3f4f6;
  border-radius: 50px;
  padding: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 2px solid transparent;
}
.color-circle {
  -webkit-appearance: none; appearance: none; background: none; border: none;
  width: 32px; height: 32px; cursor: pointer; padding: 0; border-radius: 50%;
  overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.color-circle.small { width: 28px; height: 28px; }
.color-circle::-webkit-color-swatch { border: none; border-radius: 50%; border: 1px solid rgba(0,0,0,0.05); }
.color-circle::-webkit-color-swatch-wrapper { padding: 0; }

.mini-color-stack { display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.1s; }
.mini-color-stack:hover { transform: translateY(-2px); }
.color-ring {
  width: 36px; height: 36px; border-radius: 50%; overflow: hidden; position: relative;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 2px solid #fff;
}
.color-ring input[type="color"] {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 150%; height: 150%; opacity: 0; cursor: pointer;
}
.hex-input { background: transparent; border: none; width: 60px; font-family: 'Roboto Mono', monospace; font-size: 12px; color: #4b5563; text-transform: uppercase; outline: none; }


/* --- WIDOK KOMPAKTOWY (Logic) --- */
.view-compact {
  display: flex;
  align-items: center;
  gap: 24px;
  overflow-x: visible;
  scrollbar-width: none;
}

/* --- WIDOK ROZSZERZONY (Nowe Style) --- */
.view-expanded {
  width: 100%;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}



.column-title {
  font-size: 12px;
  text-transform: uppercase;
  color: #9ca3af;
  font-weight: 700;
  margin-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 8px;
}

.expanded-field { margin-bottom: 16px; }
.expanded-field label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
  font-weight: 500;
}

.expanded-row { display: flex; gap: 12px; }
.half { flex: 1; }
.full-width { width: 100%; box-sizing: border-box; }

.large-text { font-size: 16px; padding: 10px 14px; }

/* Helpers dla Expanded */
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 16px; }

.space-between { justify-content: space-between; padding-right: 12px; }
.space-around { justify-content: space-around; }
.justify-center { justify-content: center; }

.hex-display {
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
}

/* Lista kolorów w pionie (Kolumna 2) */
.color-list-rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.color-row-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f9fafb; 
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid transparent;
  transition: border-color 0.2s;
}
.color-row-item:hover { border-color: #e5e7eb; background: #fff; }

.label-text { font-size: 13px; color: #374151; font-weight: 500; }
.color-ring.static { box-shadow: none; border: 2px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }

/* Responsive Mobile */
@media (max-width: 768px) {
  .expanded-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .config-bar-container.expanded .config-bar {
    padding: 20px;
    height: 85vh;
    overflow-y: auto;
  }
}

</style>