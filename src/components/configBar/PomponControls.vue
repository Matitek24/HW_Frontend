<template>
    <div class="section-wrapper" :class="{ 'expanded-column': !compact }">
      <div v-if="compact" class="group-section">
        <div class="group-header">Pompon</div>
  
        <div class="d-flex align-items-center justify-content-center gap-2 mb-1">
          <div class="form-check form-switch m-0">
            <input
              class="form-check-input"
              type="checkbox"
              role="switch"
              :checked="config.show"
              @change="updateShow($event.target.checked)"
            />
          </div>
        </div>
  
        <div class="pompon-carousel" :class="{ 'disabled-section': !config.show }">
          <div class="color-pill compact">
            <ColorPicker
              :model-value="config.p2"
              :color-options="colors"
              title="Pompon (Kolor 1)"
              @update:model-value="updatePomponColor(2, $event)"
              @hover="(hex) => onPomponHover(2, hex)"
              @hover-end="$emit('hover-end')"
            />
  
            <ColorPicker
              v-if="pomponMode !== 'single'"
              :model-value="config.p3"
              :color-options="colors"
              title="Pompon (Kolor 2)"
              @update:model-value="updatePomponColor(3, $event)"
              @hover="(hex) => onPomponHover(3, hex)"
              @hover-end="$emit('hover-end')"
            />
  
            <ColorPicker
              v-if="pomponMode === 'triple'"
              :model-value="config.p4"
              :color-options="colors"
              title="Pompon (Kolor 3)"
              @update:model-value="updatePomponColor(4, $event)"
              @hover="(hex) => onPomponHover(4, hex)"
              @hover-end="$emit('hover-end')"
            />
          </div>
        </div>
      </div>
  
      <template v-else>
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 class="column-title mb-0">Pompon</h3>
          <div class="form-check form-switch mb-0">
            <input
              class="form-check-input"
              type="checkbox"
              role="switch"
              :checked="config.show"
              @change="updateShow($event.target.checked)"
            />
          </div>
        </div>
  
        <div :class="{ 'disabled-section': !config.show }">
          <!-- Mode Selector -->
          <div class="mode-selector mb-3">
            <button
              v-for="opt in pomponOptions"
              :key="opt.value"
              @click="changePomponMode(opt.value)"
              class="mode-btn"
              :class="{ active: pomponMode === opt.value }"
            >
              {{ opt.label }}
            </button>
          </div>
  
          <!-- Color Pickers -->
          <div class="pompon-grid-display">
            <div class="pompon-item">
              <label>{{ pomponMode === 'single' ? 'Kolor' : 'Kolor A' }}</label>
              <ColorPicker
                :model-value="config.p2"
                :color-options="colors"
                @update:model-value="updatePomponColor(2, $event)"
                @hover="(hex) => onPomponHover(2, hex)"
                @hover-end="$emit('hover-end')"
              />
            </div>
  
            <div v-if="pomponMode !== 'single'" class="pompon-item">
              <label>Kolor B</label>
              <ColorPicker
                :model-value="config.p3"
                :color-options="colors"
                @update:model-value="updatePomponColor(3, $event)"
                @hover="(hex) => onPomponHover(3, hex)"
                @hover-end="$emit('hover-end')"
              />
            </div>
  
            <div v-if="pomponMode === 'triple'" class="pompon-item">
              <label>Kolor C</label>
              <ColorPicker
                :model-value="config.p4"
                :color-options="colors"
                @update:model-value="updatePomponColor(4, $event)"
                @hover="(hex) => onPomponHover(4, hex)"
                @hover-end="$emit('hover-end')"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue';
  import ColorPicker from '../utils/ColorPicker.vue';
  import './styles/controls.css';
  
  const props = defineProps({
    config: {
      type: Object,
      required: true
    },
    colors: {
      type: Array,
      default: () => []
    },
    compact: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['update:config', 'hover', 'hover-end']);
  
  const pomponOptions = [
    { value: 'single', label: '1' },
    { value: 'dual', label: '2' },
    { value: 'triple', label: '3' }
  ];
  
  // Detect initial mode based on color pattern
  const detectMode = () => {
    const { p1, p2, p3, p4 } = props.config;
    if (p1 === p2 && p2 === p3 && p3 === p4) return 'single';
    if (p1 === p3 && p2 === p4) return 'dual';
    return 'triple';
  };
  
  const pomponMode = ref(detectMode());
  
  // Watch for external config changes
  watch(
  () => `${props.config.p1}-${props.config.p2}-${props.config.p3}-${props.config.p4}`,
  (newVal, oldVal) => {
    // Jeśli string się zmienił (np. wczytano nowy projekt z bazy), przelicz tryb
    if (newVal !== oldVal) {
      pomponMode.value = detectMode();
    }
  }
);
  
  // Helper function to emit updated config
  const emitUpdate = (updates) => {
  emit('update:config', updates); // Zmiana! Wysyłamy tylko to co się zmieniło
};
  
  // Update show/hide
  const updateShow = (value) => {
    emitUpdate({ show: value });
  };
  
  // Change pompon mode
  const changePomponMode = (newMode) => {
  pomponMode.value = newMode;
  const updates = {};
  
  if (newMode === 'single') {
    updates.p2 = props.config.p1;
    updates.p3 = props.config.p1;
    updates.p4 = props.config.p1;
  } else if (newMode === 'dual') {
    updates.p3 = props.config.p1;
    updates.p4 = props.config.p2;
  }
  
  if (Object.keys(updates).length > 0) {
    emitUpdate(updates);
  }
};
  // Update pompon color based on mode
  const updatePomponColor = (index, hex) => {
    const updates = {}; 

    if (pomponMode.value === 'single') {
      // 1 kolor: wszystkie pompony takie same
      updates.p1 = hex;
      updates.p2 = hex;
      updates.p3 = hex;
      updates.p4 = hex;
    } 
    else if (pomponMode.value === 'dual') {
      // 2 kolory: przeplatają się (np. p1=p3, p2=p4)
      if (index === 2) {
        // Zmiana Koloru A (index 2 z templatki) wpływa na p2 i p4
        updates.p2 = hex;
        updates.p4 = hex;
      } else if (index === 3) {
        // Zmiana Koloru B (index 3 z templatki) wpływa na p1 i p3
        updates.p1 = hex;
        updates.p3 = hex;
      }
    } 
    else if (pomponMode.value === 'triple') {
      // 3 kolory: p1=p4 (żeby zamknąć pętlę ładnie), p2 i p3 osobne
      if (index === 2) updates.p2 = hex;
      if (index === 3) updates.p3 = hex;
      if (index === 4) {
        updates.p4 = hex;
        updates.p1 = hex; 
      }
    }
    
    emitUpdate(updates);
  };
  
  // Hover preview
  const onPomponHover = (index, hex) => {
    let paths = [];
  
    if (pomponMode.value === 'single') {
      paths = ['pompons.p1', 'pompons.p2', 'pompons.p3', 'pompons.p4'];
    } 
    else if (pomponMode.value === 'dual') {
      if (index === 2) {
        paths = ['pompons.p2', 'pompons.p4'];
      } else if (index === 3) {
        paths = ['pompons.p1', 'pompons.p3'];
      }
    } 
    else if (pomponMode.value === 'triple') {
      if (index === 2) paths = ['pompons.p2'];
      if (index === 3) paths = ['pompons.p3'];
      if (index === 4) paths = ['pompons.p4', 'pompons.p1'];
    }
  
    emit('hover', { paths, value: hex });
  };
  </script>
  
<style scoped>
/* Styl dla switcha (żeby był ładny) */
.form-check-input:checked {
  background-color: #5d5d5d !important;
  border-color: #1f2937 !important;
}

.form-check-input:focus {
  box-shadow: 0 0 0 0.25rem rgba(93, 93, 93, 0.25) !important;
  border-color: #5d5d5d !important;
}

.form-check {
  margin-bottom: 0.2rem;
}</style>