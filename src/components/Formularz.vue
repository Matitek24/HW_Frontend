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

          <div class="controls-row">

            <div class="control-item">
              <label class="mini-label"> TWÓJ NAPIS / TEKST</label>
              <input type="text" v-model="config.text.content" class="input-pill text-main" placeholder="Twój tekst..."
                maxlength="50" />
            </div>

            <div class="control-item">
              <label class="mini-label">CZCIONKA</label>
              <FontPicker v-model="config.text.font" :options="dictionaries.fonts"
                @hover="(fontVal) => $emit('hover', { path: 'text.font', value: fontVal })"
                @hover-end="$emit('hover-end')" />
            </div>

            <div class="control-item">
              <label class="mini-label">KOLOR TEKSTU</label>
              <div class="color-pill">

                <ColorPicker v-model="config.text.color" :color-options="dictionaries.colors"
                  @hover="(hex) => $emit('hover', { path: 'text.color', value: hex })" @hover-end="$emit('hover-end')"
                  title="Kolor Tekstu" />
                <input type="text" v-model="config.text.color" class="hex-input" maxlength="7" />
              </div>
            </div>

          </div>
        </div>

        <div class="vertical-divider"></div>

        <div class="group-section">
          <div class="group-header">KOLORY CZAPKI</div>

          <div class="controls-row">

            <div class="control-item">
              <div class="unit-header">
                <label class="mini-label">GÓRA</label>
              </div>
              <div class="picker-container">
                <ColorPicker v-model="config.base.top" :color-options="dictionaries.colors"
                  @hover="(hex) => $emit('hover', { path: 'base.top', value: hex })" @hover-end="$emit('hover-end')"
                  title="Góra czapki" />
                <span class="yarn-number">{{ getYarnNumber(config.base.top) }}</span>
              </div>
            </div>

            <div class="control-item">
              <div class="unit-header">
                <label class="mini-label">ŚRODEK</label>
              </div>
              <div class="picker-container">
                <ColorPicker v-model="config.base.middle" :color-options="dictionaries.colors"
                  @hover="(hex) => $emit('hover', { path: 'base.middle', value: hex })" @hover-end="$emit('hover-end')"
                  title="Środek czapki" />
                <span class="yarn-number">{{ getYarnNumber(config.base.middle) }}</span>
              </div>
            </div>

            <div class="control-item">
              <div class="unit-header">
                <label class="mini-label">WYWINIĘCIE</label>
              </div>
              <div class="picker-container">
                <ColorPicker v-model="config.base.bottom" :color-options="dictionaries.colors"
                  @hover="(hex) => $emit('hover', { path: 'base.bottom', value: hex })" @hover-end="$emit('hover-end')"
                  title="Wywiniecie czapki" />
                <span class="yarn-number">{{ getYarnNumber(config.base.bottom) }}</span>
              </div>
            </div>

          </div>
        </div>

        <div class="vertical-divider"></div>

        <div class="group-section">
          <div class="group-header">Wzory</div>
          <div class="controls-row compact-gap">
            <div class="mini-color-stack" title="Wzór Główny">
              <ColorPicker v-model="config.pattern.top" :color-options="dictionaries.colors"
                @hover="(hex) => $emit('hover', { path: 'pattern.top', value: hex })" @hover-end="$emit('hover-end')"
                title="Kolor Wzoru góra" />
            </div>
            <div class="select-wrapper">
              <div class="select-wrapper w-100">
                <PatternPicker v-model="config.patterns.top" :options="topPatterns" title="Wybierz wzór (Góra)" />
              </div>
            </div>
          </div>
          <div class="controls-row compact-gap">
            <div class="mini-color-stack" title="Wzór Główny">

              <ColorPicker v-model="config.pattern.main" :color-options="dictionaries.colors"
                @hover="(hex) => $emit('hover', { path: 'pattern.main', value: hex })" @hover-end="$emit('hover-end')"
                title="Kolor Wzoru dół" />
            </div>
            <div class="select-wrapper">
              <div class="select-wrapper w-100">
                <PatternPicker v-model="config.patterns.bottom" :options="bottomPatterns" title="Wybierz wzór (Góra)" />
              </div>
            </div>
          </div>
        </div>

        <div class="vertical-divider"></div>

        <div class="group-section">
          <div class="group-header">Pompon</div>

          <div class="d-flex align-items-center justify-content-center gap-2 mb-1">
            <div class="form-check form-switch m-0">
              <input class="form-check-input" type="checkbox" role="switch" v-model="config.pompons.show">
            </div>
          </div>

          <div class="pompon-carousel" :class="{ 'disabled-section': !config.pompons.show }">
            <div class="color-pill compact">
              <ColorPicker :model-value="config.pompons.p1" :color-options="dictionaries.colors" title="Pompon (Główny)"
                @update:model-value="(hex) => updatePomponColor(1, hex)" @hover="(hex) => onPomponHover(1, hex)"
                @hover-end="$emit('hover-end')" />

              <ColorPicker v-if="pomponMode !== 'single'" :model-value="config.pompons.p2"
                :color-options="dictionaries.colors" title="Pompon (Drugi)"
                @update:model-value="(hex) => updatePomponColor(2, hex)" @hover="(hex) => onPomponHover(2, hex)"
                @hover-end="$emit('hover-end')" />

              <ColorPicker v-if="pomponMode === 'quad'" :model-value="config.pompons.p3"
                :color-options="dictionaries.colors" title="Pompon (Trzeci)"
                @update:model-value="(hex) => updatePomponColor(3, hex)" @hover="(hex) => onPomponHover(3, hex)"
                @hover-end="$emit('hover-end')" />

              <ColorPicker v-if="pomponMode === 'quad'" :model-value="config.pompons.p4"
                :color-options="dictionaries.colors" title="Pompon (Czwarty)"
                @update:model-value="(hex) => updatePomponColor(4, hex)" @hover="(hex) => onPomponHover(4, hex)"
                @hover-end="$emit('hover-end')" />
            </div>
          </div>
        </div>

      </div>

      <div v-show="isExpanded" class="view-expanded">
        <div class="expanded-grid">
          <div class="expanded-column">
            <h3 class="column-title">Napis</h3>
            <div class="expanded-field">
              <input type="text" v-model="config.text.content" class="input-pill full-width large-text"
                placeholder="Twój tekst..." maxlength="50" />
            </div>

            <div class="expanded-row">
              <div class="expanded-field half">
                <label>Czcionka</label>
                <div class="select-wrapper">
                  <FontPicker v-model="config.text.font" :options="dictionaries.fonts"
                @hover="(fontVal) => $emit('hover', { path: 'text.font', value: fontVal })"
                @hover-end="$emit('hover-end')" />
                </div>
              </div>
              <div class="expanded-field half">
                <label>Kolor Tekstu</label>
                <div class="color-pill full-width space-between">
                  <ColorPicker
              v-model="config.text.color"
              :color-options="dictionaries.colors"
              @hover="(hex) => emit('hover', { path: 'text.color', value: hex })"
              @hover-end="emit('hover-end')"
            />
                  <span class="hex-display">{{ config.text.color }}</span>
                </div>
              </div>
            </div>
            <div class="expanded-row">
              <div class="expanded-field half">
                <label>
                  Rozmiar: {{ (config.text.fontSize / 8) }} px
                </label>
                <input type="range" v-model.number="config.text.fontSize" min="48" max="152" step="8"
                  class="slider compact-slider" />
              </div>
              <div class="expanded-field half">
                <label>

                  Pozycja Y: {{ ((config.text.offsetY / 6)).toFixed(1) }} px
                </label>
                <input type="range" v-model.number="config.text.offsetY" min="-60" max="60" step="6"
                  class="slider compact-slider" />
              </div>
            </div>
          </div>

          <div class="expanded-column">
            <h3 class="column-title">Kolory Czapki</h3>
            <div class="color-list-rows">
              <div class="color-row-item">
                <span class="label-text">Góra Czapki</span>
                <ColorPicker v-model="config.base.top" :color-options="dictionaries.colors"
                  @hover="(hex) => emit('hover', { path: 'base.top', value: hex })" @hover-end="emit('hover-end')" />
              </div>
              <div class="color-row-item">
                <span class="label-text">Środek Czapki</span>
                <ColorPicker v-model="config.base.middle" :color-options="dictionaries.colors"
                  @hover="(hex) => emit('hover', { path: 'base.middle', value: hex })" @hover-end="emit('hover-end')" />
              </div>
              <div class="color-row-item">
                <span class="label-text">Wywinięcie</span>
                <ColorPicker v-model="config.base.bottom" :color-options="dictionaries.colors"
                  @hover="(hex) => emit('hover', { path: 'base.bottom', value: hex })" @hover-end="emit('hover-end')" />
              </div>
            </div>
          </div>

          <div class="expanded-column">
            <h3 class="column-title">Wzory</h3>
            <div class="expanded-row">
              <div class="expanded-field grow">
                <label>Wzór Góra</label>
                <PatternPicker v-model="config.patterns.top" :options="topPatterns" :opt="true" />
              </div>
              <div class="expanded-field auto-width">
                <label>Kolor</label>
                <ColorPicker v-model="config.pattern.top" :color-options="dictionaries.colors"
                  @hover="(hex) => emit('hover', { path: 'pattern.top', value: hex })" @hover-end="emit('hover-end')" />
              </div>
            </div>
            <div class="expanded-row mt-2">
              <div class="expanded-field grow">
                <label>Wzór Środek</label>
                <PatternPicker v-model="config.patterns.bottom" :options="bottomPatterns" :opt="true" />
              </div>
              <div class="expanded-field auto-width">
                <label>Kolor</label>
                <ColorPicker v-model="config.pattern.main" :color-options="dictionaries.colors"
                  @hover="(hex) => emit('hover', { path: 'pattern.main', value: hex })"
                  @hover-end="emit('hover-end')" />
              </div>
            </div>
          </div>

          <div class="expanded-column">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h3 class="column-title mb-0">Pompon</h3>
              <div class="form-check form-switch mb-0">
                <input class="form-check-input" type="checkbox" role="switch" v-model="config.pompons.show">
              </div>
            </div>
            <div :class="{ 'disabled-section': !config.pompons.show }">
              <div class="mode-selector mb-3">
                <button v-for="opt in pomponOptions" :key="opt.value" @click="pomponMode = opt.value" class="mode-btn"
                  :class="{ active: pomponMode === opt.value }">
                  {{ opt.label }}
                </button>
              </div>
              <div class="pompon-grid-display">
                <div class="pompon-item">
                  <label>{{ pomponMode === 'single' ? 'Kolor' : 'Kolor A' }}</label>
                  <ColorPicker :model-value="config.pompons.p1" :color-options="dictionaries.colors"
                    @update:model-value="(hex) => updatePomponColor(1, hex)" @hover="(hex) => onPomponHover(1, hex)"
                    @hover-end="emit('hover-end')" />
                </div>
                <div class="pompon-item" v-if="pomponMode !== 'single'">
                  <label>Kolor B</label>
                  <ColorPicker :model-value="config.pompons.p2" :color-options="dictionaries.colors"
                    @update:model-value="(hex) => updatePomponColor(2, hex)" @hover="(hex) => onPomponHover(2, hex)"
                    @hover-end="emit('hover-end')" />
                </div>
                <div class="pompon-item" v-if="pomponMode === 'quad'">
                  <label>Kolor C</label>
                  <ColorPicker :model-value="config.pompons.p3" :color-options="dictionaries.colors"
                    @update:model-value="(hex) => updatePomponColor(3, hex)" @hover="(hex) => onPomponHover(3, hex)"
                    @hover-end="emit('hover-end')" />
                </div>
                <div class="pompon-item" v-if="pomponMode === 'quad'">
                  <label>Kolor D</label>
                  <ColorPicker :model-value="config.pompons.p4" :color-options="dictionaries.colors"
                    @update:model-value="(hex) => updatePomponColor(4, hex)" @hover="(hex) => onPomponHover(4, hex)"
                    @hover-end="emit('hover-end')" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue';
import ColorPicker from '../components/utils/ColorPicker.vue';
import PatternPicker from '../components/utils/PatternPicker.vue';
import FontPicker from '../components/utils/FontPicker.vue';
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
const hoverState = reactive({
  paths: [],  // np. 'base.top'
  value: null  // np. '#FF0000'
});

const previewConfig = computed(() => {
  // Robimy głęboką kopię obecnego configu
  const base = JSON.parse(JSON.stringify(props.config));

  // Jeśli użytkownik na coś najeżdża, nadpisujemy to w kopii podglądu
  if (hoverState.path && hoverState.value) {
    const keys = hoverState.path.split('.'); // np. ['base', 'top']
    if (keys.length === 2) {
      base[keys[0]][keys[1]] = hoverState.value;
    } else if (keys.length === 1) {
      base[keys[0]] = hoverState.value;
    }
  }
  return base;
});

const onHover = (path, val) => {
  hoverState.path = path;
  hoverState.value = val;
};
const onHoverEnd = () => {
  hoverState.path = null;
  hoverState.value = null;
};

const getYarnNumber = (hex) => {
  if (!props.dictionaries?.colors) return hex;
  const color = props.dictionaries.colors.find(c => c.wartosc === hex);
  return color ? color.nazwa : hex;
};

// src/components/Formularz.vue

const emit = defineEmits(['toggle-expand', 'hover', 'hover-end']); // dodaj hover i hover-end

const detectInitialMode = () => {
  const { p1, p2, p3, p4 } = props.config.pompons;

  // Sprawdzamy czy wszystkie 4 kolory są identyczne
  if (p1 === p2 && p2 === p3 && p3 === p4) {
    return 'single';
  }

  // Sprawdzamy układ "na przemian" (1 taki sam jak 3, a 2 taki sam jak 4)
  if (p1 === p3 && p2 === p4) {
    return 'dual';
  }

  // W każdym innym przypadku zakładamy, że to 4 różne kolory
  return 'quad';
};
// 2. Inicjalizacja refa wynikiem tej funkcji
const pomponMode = ref(detectInitialMode());

watch(pomponMode, (newMode) => {

  const p = props.config.pompons;

  if (newMode === 'single') {

    p.p2 = p.p1;
    p.p3 = p.p1;
    p.p4 = p.p1;
  }
  else if (newMode === 'dual') {
    p.p3 = p.p1;
    p.p4 = p.p2;
  }
});
const onPomponHover = (index, hex) => {
  let paths = [];

  if (pomponMode.value === 'single') {
    paths = ['pompons.p1', 'pompons.p2', 'pompons.p3', 'pompons.p4'];
  }
  else if (pomponMode.value === 'dual') {
    paths = index === 1 ? ['pompons.p1', 'pompons.p3'] : ['pompons.p2', 'pompons.p4'];
  }
  else {
    paths = [`pompons.p${index}`];
  }

  emit('hover', { paths, value: hex });
};
const updatePomponColor = (index, hex) => {

  if (pomponMode.value === 'single') {
    props.config.pompons.p1 = hex;
    props.config.pompons.p2 = hex;
    props.config.pompons.p3 = hex;
    props.config.pompons.p4 = hex;
  }
  else if (pomponMode.value === 'dual') {

    if (index === 1) {
      props.config.pompons.p1 = hex;
      props.config.pompons.p3 = hex;
    } else if (index === 2) {
      props.config.pompons.p2 = hex;
      props.config.pompons.p4 = hex;
    }
  }
  else {
    if (index === 1) props.config.pompons.p1 = hex;
    if (index === 2) props.config.pompons.p2 = hex;
    if (index === 3) props.config.pompons.p3 = hex;
    if (index === 4) props.config.pompons.p4 = hex;
  }
};

const pomponOptions = [
  { value: 'single', label: '1' },
  { value: 'dual', label: '2' },
  { value: 'quad', label: '4' },
];


const isExpanded = ref(false);


const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
  emit('toggle-expand', isExpanded.value);

};

const topPatterns = computed(() =>
  props.dictionaries.patterns.filter(p => p.kategoria === 'TOP')
);

const bottomPatterns = computed(() =>
  props.dictionaries.patterns.filter(p => p.kategoria === 'BOTTOM')
);


</script>

<style scoped>
/* Kontener pojedynczego elementu sterującego */
.control-item {
  display: flex;
  flex-direction: column;
  align-items: center !important;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  border-radius: 12px;
  transition: all 0.2s ease;
  min-width: 80px;
}



/* Etykieta */
.mini-label {
  font-size: 9px;
  font-weight: 800;
  color: #6b7280;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* Kontener na picker i numer przędzy */
.picker-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

/* Numer przędzy pod kółkiem */
.yarn-number {
  font-size: 10px;
  font-family: 'Roboto Mono', monospace;
  font-weight: 600;
  color: #929292;
  margin-top: 2px;
}

/* Układ rzędu */
.controls-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

/* Kontener dla pojedynczego pola z labelką */
.control-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  /* Odstęp między labelką a polem */
}

/* Styl dla małych nagłówków nad polami */
.mini-label {
  font-size: 9.5px;
  /* Bardzo mały, ale czytelny */
  font-weight: 800;
  color: #9ca3af;
  /* Jasny szary, żeby nie przytłaczał */
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-left: 4px;
}

/* Poprawka dla controls-row, aby elementy wyrównały się do góry, skoro mają labelki */
.controls-row {
  display: flex;
  align-items: flex-start;
  /* Zmiana z center na flex-start */
  gap: 12px;
}

/* Dopasowanie szerokości font picker w kompakcie */
.select-pill-font {
  min-width: 120px;
}

/* Stylowanie przełącznika trybów (pigułki) */
.mode-selector {
  display: flex;
  background: #f3f4f6;
  padding: 4px;
  border-radius: 12px;
  gap: 4px;
}

.mode-btn {
  flex: 1;
  border: none;
  background: transparent;
  padding: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;
}

.mode-btn.active {
  background: white;
  color: #1f2937;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.mode-btn:hover:not(.active) {
  background: rgba(255, 255, 255, 0.5);
}

.expanded-column {
  display: flex;
  flex-direction: column;
  position: relative;
  /* Kluczowe dla umieszczenia kreski */
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-webkit-slider-thumb:hover {
  background: #484848;
  transform: scale(1.1);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb:hover {
  background: #5568d3;
  transform: scale(1.2);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
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
.expanded-row {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.grow {
  flex-grow: 1;
}

.auto-width {
  width: auto;
  flex-shrink: 0;
}

.mt-2 {
  margin-top: 12px;
}

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
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.color-dropdown {
  position: absolute;
  bottom: calc(100% + 8px);
  right: 0;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  transition: all 0.2s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-dropdown-swatch:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.slide-fade-enter-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter-from {
  transform: translateY(10px) scale(0.95);
  /* zmienione z -10px na 10px */
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(5px);
  /* zmienione z -5px na 5px */
  opacity: 0;
}

/* Usuń stare elementy */
.db-color-palette {
  display: none;
}

.color-ring input[type="color"] {
  display: none;
}

.disabled-section {
  opacity: 0.5;
  pointer-events: none;
  /* Blokuje klikanie */
  filter: grayscale(100%);
}

/* Styl dla switcha (żeby był ładny) */
.form-check-input:checked {
  background-color: #5d5d5d;
  border-color: #1f29374b;
}

.form-check {
  margin-bottom: 0.2rem;
}

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
  pointer-events: none;
  /* Żeby kliknięcie obok nie łapało */
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
  box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.03);
  border-bottom: none;
}

.chevron {
  border: solid #252525;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  transition: transform 0.3s;
}

.chevron.up {
  transform: rotate(-135deg) translateY(-2px);
}

.chevron.down {
  transform: rotate(45deg) translateY(-2px);
}


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
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);

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

.vertical-divider {
  width: 1px;
  height: 40px;
  background: #e5e7eb;
  margin: 0 4px;
}

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

.select-pill {
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

.input-pill:focus {
  background: #ffffff;
  border-color: #3b82f6;
}

.text-main {
  width: 140px;
  font-weight: 500;
}

.select-pill {
  cursor: pointer;
  padding-right: 24px;
}

.select-pill.short {
  width: auto;
  width: 100px;
}

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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-circle.small {
  width: 28px;
  height: 28px;
}

.color-circle::-webkit-color-swatch {
  border: none;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.color-circle::-webkit-color-swatch-wrapper {
  padding: 0;
}

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
  opacity: 0;
  cursor: pointer;
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
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
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

.expanded-field {
  margin-bottom: 16px;
}

.expanded-field label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
  font-weight: 500;
}

.expanded-row {
  display: flex;
  gap: 12px;
}

.half {
  flex: 1;
}

.full-width {
  width: 100%;
  box-sizing: border-box;
}

.large-text {
  font-size: 16px;
  padding: 10px 14px;
}

/* Helpers dla Expanded */
.mt-2 {
  margin-top: 8px;
}

.mt-3 {
  margin-top: 16px;
}

.space-between {
  justify-content: space-between;
  padding-right: 12px;
}

.space-around {
  justify-content: space-around;
}

.justify-center {
  justify-content: center;
}

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

.color-row-item:hover {
  border-color: #e5e7eb;
  background: #fff;
}

.label-text {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.color-ring.static {
  box-shadow: none;
  border: 2px solid #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

/* Responsive Mobile */

@media (max-width: 600px) {
  .expanded-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .config-bar-container.expanded .config-bar {
    padding: 20px;
    height: 85vh;
    overflow-y: auto;
  }

  .expanded-grid {
    grid-template-columns: 1fr;
    /* Jedna kolumna */
    gap: 30px;
  }

  /* 2. WYSOKOŚĆ PANELU PO ROZWINIĘCIU */
  .config-bar-container.expanded .config-bar {
    padding: 24px 24px 80px 24px;
    height: 34vh;
    max-height: 500px;

    overflow-y: auto;
    /* Scrollowanie wewnątrz paska */
    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.15);
    /* Mocniejszy cień do góry */
  }

  /* 3. CZYSZCZENIE WIDOKU KOMPAKTOWEGO (Zostaje tylko Tekst) */

  /* Ukryj wszystkie sekcje grupowe OPRÓCZ pierwszej (Personalizacja) */
  .view-compact .group-section:not(:first-child) {
    display: none;
  }

  /* Ukryj wszystkie pionowe kreski */
  .view-compact .vertical-divider {
    display: none;
  }

  /* Wyśrodkuj tę jedyną sekcję, która została */
  .view-compact {
    justify-content: center;
    width: 100%;
  }

  /* Lekka korekta inputów, żeby się ładnie mieściły w jednej linii */
  .text-main {
    width: 100px;
    /* Trochę węższy input tekstu */
  }

  .select-pill-font {
    width: 100px;
  }

  /* Przycisk toggle (strzałka) trochę niżej na mobile */
  .toggle-wrapper {
    top: -35px;
  }

  .toggle-btn {
    height: 35px;
    width: 50px;
  }
}
</style>