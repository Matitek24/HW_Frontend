<template>
  <div class="config-bar-container" :class="{ 'expanded': isExpanded }">
    
    <div class="toggle-wrapper" @click="toggleExpand">
      <div class="toggle-btn">
        <span class="chevron" :class="{ 'up': !isExpanded, 'down': isExpanded }"></span>
      </div>
    </div>

    <div class="config-bar">
      
      <div v-if="!isExpanded" class="view-compact">
        
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
                <option value="Arial, sans-serif">Arial</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="'Courier New', monospace">Courier</option>
                <option value="Verdana, sans-serif">Verdana</option>
              </select>
            </div>
            <div class="color-pill">
              <input type="color" v-model="config.text.color" class="color-circle" />
              <input type="text" v-model="config.text.color" class="hex-input" maxlength="7" />
            </div>
          </div>
        </div>
  
        <div class="vertical-divider"></div>
  
        <div class="group-section">
          <div class="group-header">Kolory Czapki</div>
          <div class="controls-row compact-gap">
            <div class="mini-color-stack" title="Góra">
              <div class="color-ring" :style="{ backgroundColor: config.base.top }">
                <input type="color" v-model="config.base.top" />
              </div>
            </div>
            <div class="mini-color-stack" title="Środek">
              <div class="color-ring" :style="{ backgroundColor: config.base.middle }">
                <input type="color" v-model="config.base.middle" />
              </div>
            </div>
            <div class="mini-color-stack" title="Dół">
              <div class="color-ring" :style="{ backgroundColor: config.base.bottom }">
                <input type="color" v-model="config.base.bottom" />
              </div>
            </div>
          </div>
        </div>

        <div class="vertical-divider"></div>

        <div class="group-section">
          <div class="group-header">Wzory</div>
          <div class="controls-row compact-gap">
             <div class="mini-color-stack" title="Wzór Główny">
              <div class="color-ring pattern" :style="{ backgroundColor: config.pattern.top }">
                <input type="color" v-model="config.pattern.top" />
              </div>
            </div>
             <div class="select-wrapper">
               <select v-model="config.patterns.top" class="input-pill select-pill short">
                <option value="none">Brak</option>
                <option value="gora1">gora1</option>
                <option value="gora2">gora2</option>
               </select>
             </div>
          </div>
          <div class="controls-row compact-gap">
             <div class="mini-color-stack" title="Wzór Główny">
              <div class="color-ring pattern" :style="{ backgroundColor: config.pattern.main }">
                <input type="color" v-model="config.pattern.main" />
              </div>
            </div>
             <div class="select-wrapper">
               <select v-model="config.patterns.bottom" class="input-pill select-pill short">
                <option value="none">Brak</option>
                <option value="triangles2">Usmiech</option>
                <option value="triangles">Trójkąty</option>
                <option value="smile">Trójkat_v2</option>
               </select>
             </div>
          </div>
        </div>

        <div class="vertical-divider"></div>
  
        <div class="group-section">
          <div class="group-header">Pompony</div>
          <div class="pompon-carousel">
            <div class="color-pill compact">
              <input type="color" v-model="config.pompons.p1" class="color-circle small" />
              <input type="color" v-model="config.pompons.p2" class="color-circle small" />
              <input type="color" v-model="config.pompons.p3" class="color-circle small" />
              <input type="color" v-model="config.pompons.p4" class="color-circle small" />
            </div>
          </div>
        </div>

      </div>

      <div v-else class="view-expanded">
        
        <div class="expanded-grid">
          
          <div class="expanded-column">
            <h3 class="column-title">Personalizacja Tekstu</h3>
            
            <div class="expanded-field">
              <label>Treść napisu</label>
              <input 
                type="text" 
                v-model="config.text.content" 
                class="input-pill full-width large-text"
                placeholder="Wpisz tekst..."
              />
            </div>

            <div class="expanded-row">
              <div class="expanded-field half">
                <label>Czcionka</label>
                <div class="select-wrapper">
                  <select v-model="config.text.font" class="input-pill select-pill full-width">
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="'Times New Roman', serif">Times New Roman</option>
                    <option value="'Courier New', monospace">Courier</option>
                    <option value="Verdana, sans-serif">Verdana</option>
                  </select>
                </div>
              </div>
              <div class="expanded-field half">
                 <label>Kolor tekstu</label>
                 <div class="color-pill full-width space-between">
                    <input type="color" v-model="config.text.color" class="color-circle" />
                    <span class="hex-display">{{ config.text.color }}</span>
                 </div>
              </div>
             
            </div>
            <div class="expanded-row">
              <div class="expanded-field half">
              <label>Rozmiar Czcionki: {{ config.text.fontSize }}px</label>
              <input 
                type="range" 
                v-model.number="config.text.fontSize" 
                min="30" 
                max="150" 
                step="5"
                class="slider"
              />
            </div>
            </div>
          </div>

          <div class="expanded-column">
            <h3 class="column-title">Konfiguracja Bazy</h3>
            
            <div class="color-list-rows">
              <div class="color-row-item">
                <span class="label-text">Góra czapki</span>
                <div class="color-ring static" :style="{ backgroundColor: config.base.top }">
                   <input type="color" v-model="config.base.top" />
                </div>
              </div>
              <div class="color-row-item">
                <span class="label-text">Pasek Środkowy</span>
                <div class="color-ring static" :style="{ backgroundColor: config.base.middle }">
                   <input type="color" v-model="config.base.middle" />
                </div>
              </div>
              <div class="color-row-item">
                <span class="label-text">Dół czapki</span>
                <div class="color-ring static" :style="{ backgroundColor: config.base.bottom }">
                   <input type="color" v-model="config.base.bottom" />
                </div>
              </div>
            </div>
          </div>

          <div class="expanded-column">
            <h3 class="column-title">Wzory i Pompony</h3>
            
            <div class="expanded-row">
               <div class="expanded-field half">
                  <label>Wzór Góra</label>
                  <div class="select-wrapper">
                    <select v-model="config.patterns.top" class="input-pill select-pill full-width">
                      <option value="none">Brak</option>
                      <option value="gora1">Wzór G1</option>
                      <option value="gora2">Wzór G2</option>
                    </select>
                  </div>
               </div>
               <div class="expanded-field half">
                  <label>Kolor Wz. Góra</label>
                  <div class="color-pill justify-center">
                    <input type="color" v-model="config.pattern.top" class="color-circle" />
                  </div>
               </div>
            </div>

            <div class="expanded-row mt-2">
               <div class="expanded-field half">
                  <label>Wzór Dół</label>
                  <div class="select-wrapper">
                    <select v-model="config.patterns.bottom" class="input-pill select-pill full-width">
                      <option value="none">Brak</option>
                <option value="triangles2">Usmiech</option>
                <option value="triangles">Trójkąty</option>
                <option value="smile">Trójkat_v2</option>
                    </select>
                  </div>
               </div>
               <div class="expanded-field half">
                  <label>Kolor Wz. Dół</label>
                  <div class="color-pill justify-center">
                    <input type="color" v-model="config.pattern.main" class="color-circle" />
                  </div>
               </div>
            </div>
            
            <div class="expanded-field mt-3">
              <label>Kolory Pomponów</label>
              <div class="color-pill full-width space-around">
                 <input type="color" v-model="config.pompons.p1" class="color-circle small" />
                 <input type="color" v-model="config.pompons.p2" class="color-circle small" />
                 <input type="color" v-model="config.pompons.p3" class="color-circle small" />
                 <input type="color" v-model="config.pompons.p4" class="color-circle small" />
              </div>
            </div>
           
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  config: {
    type: Object,
    required: true
  }
});

const isExpanded = ref(false);

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

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
  top: -30px; 
  left: 0; 
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 101;
  pointer-events: none; /* Żeby kliknięcie obok nie łapało */
}

.toggle-btn {
  pointer-events: auto;
  width: 64px;
  height: 34px;
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
  transition: all 0.3s ease;
}

.config-bar-container.expanded .config-bar {
  width: 100%;
  max-width: 1000px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  padding: 30px 40px;
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
  overflow-x: auto;
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

.expanded-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr; /* Trzy równe kolumny */
  gap: 40px; /* Dużo powietrza */
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
  background: #f9fafb; /* Bardzo jasne tło dla wiersza */
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