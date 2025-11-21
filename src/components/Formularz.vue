<template>
    <div class="config-bar-container">
      
      <div class="config-bar">
        
        <!-- SEKCJA 1: TEKST -->
        <div class="group-section">
          <div class="group-header">
            <span class="icon"></span> Personalizacja
          </div>
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
            <!-- Color Control z HEX -->
            <div class="color-pill">
              <input type="color" v-model="config.text.color" class="color-circle" />
              <input 
                type="text" 
                v-model="config.text.color" 
                class="hex-input" 
                maxlength="7"
              />
            </div>
          </div>
        </div>
  
        <div class="vertical-divider"></div>
  
        <!-- SEKCJA 2: BAZA I WZÓR (Połączone dla oszczędności miejsca) -->
        <div class="group-section">
          <div class="group-header">
            <span class="icon"></span> Kolory Bazy & Wzór
          </div>
          <div class="controls-row compact-gap">
            <!-- Helper component-like structure for colors -->
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
            
            <div class="mini-divider"></div>
  
            <div class="mini-color-stack" title="Wzór Główny">
              <div class="color-ring pattern" :style="{ backgroundColor: config.pattern.main }">
                <input type="color" v-model="config.pattern.main" />
              </div>
            </div>
             <div class="mini-color-stack" title="Wzór Góra">
              <div class="color-ring pattern" :style="{ backgroundColor: config.pattern.top }">
                <input type="color" v-model="config.pattern.top" />
              </div>
            </div>
          </div>
        </div>
  
        <div class="vertical-divider"></div>
  
        <!-- SEKCJA 3: POMPONY (Circular Carousel Style) -->
        <div class="group-section">
          <div class="group-header">
            <span class="icon"></span> Pompony
          </div>
          <div class="pompon-carousel">
            <div class="color-pill compact">
              <input type="color" v-model="config.pompons.p1" class="color-circle small" />
              <input type="color" v-model="config.pompons.p2" class="color-circle small" />
              <input type="color" v-model="config.pompons.p3" class="color-circle small" />
              <input type="color" v-model="config.pompons.p4" class="color-circle small" />
            </div>
          </div>
        </div>

        <div class="group-section">
  <div class="group-header">
    <span class="icon">🎨</span> Wzory
  </div>
  <div class="controls-row">
    
    <!-- Select dla wzoru góra -->
    <div class="select-wrapper">
      <label class="mini-label"></label>
      <select v-model="config.patterns.top" class="input-pill select-pill">
        <option value="none">Brak</option>
        <option value="snowflakes">Śnieżynki</option>
        <option value="triangles">Trójkąty</option>
        <option value="diamonds">Diamenty</option>
      </select>
    </div>
    
    <!-- Select dla wzoru dół -->
    <div class="select-wrapper">
      <label class="mini-label"></label>
      <select v-model="config.patterns.bottom" class="input-pill select-pill">
        <option value="none">Brak</option>
        <option value="snowflakes">Śnieżynki</option>
        <option value="triangles">Trójkąty</option>
        <option value="diamonds">Diamenty</option>
      </select>
    </div>
    
  </div>
</div>

  
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    config: {
      type: Object,
      required: true
    }
  });


  </script>
  
  <style scoped>
  .config-bar-container {
    position: fixed;
    bottom: 30px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    padding: 0 20px;
    z-index: 100;
    font-family: 'Inter', 'Segoe UI', sans-serif;
  }
  
  /* Główna belka */
  .config-bar {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 12px 24px;
    border-radius: 24px;
    box-shadow: 
      0 10px 40px rgba(0, 0, 0, 0.08),
      0 0 0 1px rgba(0, 0, 0, 0.03);
    display: flex;
    align-items: center;
    gap: 24px;
    max-width: 100%;
    overflow-x: auto; /* Zabezpieczenie na małe ekrany */
    scrollbar-width: none; /* Ukrycie paska przewijania */
  }
  
  /* Sekcje */
  .group-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .group-header {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #9ca3af;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .controls-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .controls-row.compact-gap {
    gap: 8px;
  }
  
  /* Separatory */
  .vertical-divider {
    width: 1px;
    height: 40px;
    background: #e5e7eb;
    margin: 0 4px;
  }
  
  .mini-divider {
    width: 1px;
    height: 24px;
    background: #f3f4f6;
    margin: 0 4px;
  }
  
  /* STYLIZACJA INPUTÓW (PILLS) */
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
  
  .input-pill:focus {
    background: #ffffff;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .text-main {
    width: 140px;
    font-weight: 500;
  }
  
  .select-pill {
    cursor: pointer;
    appearance: none; /* Usuwa domyślną strzałkę w niektórych przeglądarkach */
    padding-right: 24px;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 8px center;
    background-size: 12px;
  }
  
  /* KOMPONENT KOLORU Z HEXEM */
  .color-pill {
    background: #f3f4f6;
    border-radius: 50px; /* Pełne zaokrąglenie */
    padding: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
    border: 2px solid transparent;
    transition: border-color 0.2s;
  }
  
  .color-pill:focus-within {
    border-color: #3b82f6;
    background: #fff;
  }
  
  .color-circle {
    -webkit-appearance: none;
    appearance: none;
    background: none;
    border: none;
    width: 32px;
    height: 32px;
    cursor: pointer;
    padding: 0;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .color-circle.small {
    width: 28px;
    height: 28px;
  }
  
  .color-circle::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  
  .color-circle::-webkit-color-swatch {
    border: none;
    border-radius: 50%;
    border: 1px solid rgba(0,0,0,0.05);
  }
  
  .hex-input {
    background: transparent;
    border: none;
    width: 60px;
    font-family: 'Roboto Mono', monospace;
    font-size: 12px;
    color: #4b5563;
    text-transform: uppercase;
    outline: none;
  }
  
  /* STYLIZACJA "KARUZELI" (Kółka bez HEX) */
  .mini-color-stack {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: transform 0.1s;
  }
  .mini-color-stack:hover {
    transform: translateY(-2px);
  }
  
  .color-ring {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    overflow: hidden;
    position: relative;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 2px solid #fff;
  }
  
  .color-ring input[type="color"] {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 150%;
    height: 150%;
    padding: 0;
    margin: 0;
    opacity: 0;
    cursor: pointer;
  }
  
  .pompon-carousel {
    display: flex;
    align-items: center;
  }
  
  .color-pill.compact {
    padding: 4px 8px;
    gap: 6px;
  }
  </style>