<template>
  <div class="config-bar-container" :class="{ 'expanded': effectiveExpanded, 'desktop-config': desktopMode }">
    <!-- Toggle Button (Hidden in desktop mode) -->
    <div v-if="!desktopMode" class="toggle-wrapper" @click="toggleExpand">
      <div class="toggle-btn">
        <span class="chevron" :class="{ 'up': !effectiveExpanded, 'down': effectiveExpanded }"></span>
      </div>
    </div>

    <div class="config-bar">
      <!-- Compact View -->
      <div v-if="!effectiveExpanded" class="view-compact">
        
        <TextControls :config="config.text" :colors="dictionaries.colors" :fonts="dictionaries.fonts" compact
          @update:config="updateConfig('text', $event)" @hover="$emit('hover', $event)"
          @hover-end="$emit('hover-end')" />

        <div class="vertical-divider"></div>

        <HatColorControls :config="config.base" :colors="dictionaries.colors" :get-yarn-number="getYarnNumber" compact
          @update:config="updateConfig('base', $event)" @hover="$emit('hover', $event)"
          @hover-end="$emit('hover-end')" />

        <div class="vertical-divider"></div>

        <PatternControls :pattern-colors="config.pattern" :patterns="config.patterns" :colors="dictionaries.colors"
          :top-patterns="topPatterns" :bottom-patterns="bottomPatterns" compact
          @update:pattern-colors="updateConfig('pattern', $event)" @update:patterns="updateConfig('patterns', $event)"
          @hover="$emit('hover', $event)" @hover-end="$emit('hover-end')" />

        <div class="vertical-divider"></div>

        <PomponControls :config="config.pompons" :colors="dictionaries.colors" compact
          @update:config="updateConfig('pompons', $event)" @hover="$emit('hover', $event)"
          @hover-end="$emit('hover-end')" />

        <div class="vertical-divider"></div>

        <LogoControls :config="config.logo" compact
          @update:config="updateConfig('logo', $event)" />
      </div>

      <!-- Footer Info (Compact) -->
      <FooterInfo v-if="!effectiveExpanded" />

      <!-- Expanded View -->
      <div v-if="effectiveExpanded" class="view-expanded">
        <div class="expanded-grid">
          <!-- Przełącznik widoku (tylko desktop) -->
          <!-- Wybór widoku (tylko desktop): miniatura + przyciski -->
            <div v-if="desktopMode" class="view-picker">
              <div
                class="mini-thumbnail"
                :class="{
                  'mini-thumbnail-front': activeView === 'flat',
                  'mini-thumbnail-flat': activeView === 'front'
                }"
                role="button"
                tabindex="0"
                @click="toggleView"
                @keydown.enter.prevent="toggleView"
                @keydown.space.prevent="toggleView"
              >
              <KeepAlive>
                <HatFlat v-if="activeView === 'front'" :config="thumbConfig" :patternsDict="dictionaries.patterns" />
                <HatFront v-else :config="thumbConfig" :show-pompon="thumbConfig.pompons?.show"
                  :patternsDict="dictionaries.patterns" />
              </KeepAlive>
                <div class="mini-overlay">
                  <span>{{ activeView === 'front' ? 'Widok Płaski' : 'Widok 3D' }}</span>
                </div>
              </div>

              <div class="view-switch" role="tablist" aria-label="Widok czapki">
                <button type="button" role="tab" class="view-switch__btn"
                  :class="{ active: activeView === 'flat' }" :aria-selected="activeView === 'flat'"
                  @click="emit('update:activeView', 'flat')">Płaski</button>
                <button type="button" role="tab" class="view-switch__btn"
                  :class="{ active: activeView === 'front' }" :aria-selected="activeView === 'front'"
                  @click="emit('update:activeView', 'front')">Frontalny</button>
              </div>
            </div>

          <TextControls :config="config.text" :colors="dictionaries.colors" :fonts="dictionaries.fonts"
            @update:config="updateConfig('text', $event)" @hover="$emit('hover', $event)"
            @hover-end="$emit('hover-end')" />

          <HatColorControls :config="config.base" :colors="dictionaries.colors" :get-yarn-number="getYarnNumber"
            @update:config="updateConfig('base', $event)" @hover="$emit('hover', $event)"
            @hover-end="$emit('hover-end')" />

          <PatternControls :pattern-colors="config.pattern" :patterns="config.patterns" :colors="dictionaries.colors"
            :top-patterns="topPatterns" :bottom-patterns="bottomPatterns"
            @update:pattern-colors="updateConfig('pattern', $event)" @update:patterns="updateConfig('patterns', $event)"
            @hover="$emit('hover', $event)" @hover-end="$emit('hover-end')" />

          <div class="pompon-logo-group">
            <PomponControls :config="config.pompons" :colors="dictionaries.colors"
              @update:config="updateConfig('pompons', $event)" @hover="$emit('hover', $event)"
              @hover-end="$emit('hover-end')" />

            <LogoControls :config="config.logo"
              @update:config="updateConfig('logo', $event)" />
          </div>
        </div>

        <FooterInfo />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import TextControls from './TextControls.vue';
import HatColorControls from './HatColorControls.vue';
import PatternControls from './PatternControls.vue';
import PomponControls from './PomponControls.vue';
import FooterInfo from './FooterInfo.vue';
import LogoControls from './LogoControls.vue';
import HatFlat from '../hat/HatFlat.vue';
import HatFront from '../hat/HatFront.vue';

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
  },
  desktopMode: {
    type: Boolean,
    default: false
  },
  activeView: {
    type: String,
    default: 'front'
  },
  previewConfig: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['toggle-expand', 'hover', 'hover-end', 'update:config', 'update:activeView']);

const isExpanded = ref(false);

const effectiveExpanded = computed(() => props.desktopMode || isExpanded.value);

const thumbConfig = computed(() => props.previewConfig || props.config);

const toggleView = () => {
  emit('update:activeView', props.activeView === 'front' ? 'flat' : 'front');
};

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
  emit('toggle-expand', isExpanded.value);
};

const updateConfig = (section, updates) => {
  emit('update:config', {
    ...props.config,
    [section]: { ...props.config[section], ...updates }
  });
};

const getYarnNumber = (hex) => {
  if (!props.dictionaries?.colors) return hex;

  // Znajdujemy index koloru w całej liście
  const colorIndex = props.dictionaries.colors.findIndex(c => c.wartosc === hex);
  const color = props.dictionaries.colors[colorIndex];

  if (!color) return hex;

  return `${color.nazwa} / ${colorIndex + 1}`;
};

const topPatterns = computed(() =>
  props.dictionaries.patterns.filter(p => p.kategoria === 'TOP')
);

const bottomPatterns = computed(() =>
  props.dictionaries.patterns.filter(p => p.kategoria === 'BOTTOM')
);
</script>

<style scoped>
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
  transition: transform 0.5s ease-in-out;
}

.config-bar-container.expanded {
  bottom: 0;
  padding: 0;
  height: auto;
  align-items: flex-end;
}

/* --- DESKTOP CONFIG OVERRIDES --- */
.config-bar-container.desktop-config {
  position: static;
  height: auto;
  padding: 0;
  align-items: flex-start;
  z-index: 1;
}

.config-bar-container.desktop-config .config-bar {
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: none;
  padding: 0;
  margin: 0;
}

.config-bar-container.desktop-config .expanded-grid {
  grid-template-columns: 1fr;
  gap: 32px;
}

.config-bar-container.desktop-config .pompon-logo-group {
  flex-direction: column;
  gap: 32px;
}

/* --- TOGGLE BUTTON --- */
.toggle-wrapper {
  position: absolute;
  top: -40px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: -1;
  pointer-events: none;
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
  -webkit-backdrop-filter: blur(12px);
  padding: 12px 24px;
  border-radius: 24px;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(0, 0, 0, 0.03);
  max-width: 100%;
}

.config-bar-container.expanded .config-bar {
  width: 100%;
  max-width: 1400px;
  padding: 20px 30px;
  margin: 0 auto;
  border-radius: 24px 24px 0 0;
}

/* --- WIDOK KOMPAKTOWY --- */
.view-compact {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding-top: 20px !important;
  margin-top: -10px;

}

@media screen and (min-width: 800px) {
  .view-compact {
    padding-right: 40px !important;
    margin-right: -20px;
  }

}

.view-compact::-webkit-scrollbar {
  display: none;
}

.vertical-divider {
  width: 1px;
  height: 40px;
  background: #e5e7eb;
  margin: 0 4px;
  flex-shrink: 0;
}

/* --- WIDOK ROZSZERZONY --- */
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

.expanded-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 1fr;
  gap: 24px;
}

/* Pompon + Logo side-by-side in the last grid cell */
.pompon-logo-group {
  display: flex;
  gap: 16px;
}

.pompon-logo-group > * {
  flex: 1;
  min-width: 0;
}

/* --- RESPONSIVE --- */
@media (max-width: 1024px) {
  .expanded-grid {
    grid-template-columns: 1fr 1fr;
    gap: 30px;
  }

  .pompon-logo-group {
    flex-direction: column;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .expanded-grid {
    grid-template-columns: 1fr;
  }

  .pompon-logo-group {
    flex-direction: row;
    gap: 16px;
  }

  .pompon-logo-group > * {
    flex: 1;
  }
}

@media (max-width: 600px) {
  .view-compact {
    gap: 10px;
    padding: 0 5px;
    justify-content: center;
    width: 100%;
  }

  .view-compact>*:not(:first-child):not(.vertical-divider) {
    display: none;
  }

  .vertical-divider {
    display: none;
  }

  .config-bar-container {
    bottom: calc(10px + env(safe-area-inset-bottom)) !important;
    padding: 0 10px !important;
  }

  .config-bar {
    border-radius: 20px !important;
    padding: 15px !important;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  }

  .config-bar-container.expanded .config-bar {
    height: 48vh;
    max-height: 33vh;
    padding: 30px !important;
    overflow-y: auto;
    box-shadow: 0 -5px 30px rgba(0, 0, 0, 0.15);
    -webkit-overflow-scrolling: touch;
  }

  .expanded-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    width: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
  }

  .pompon-logo-group {
    flex-direction: column;
    gap: 16px;
  }

  .toggle-wrapper {
    top: -35px;
  }

  .toggle-btn {
    height: 35px;
    width: 50px;
  }
}
/* --- WYBÓR WIDOKU --- */
.view-picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 36px;              /* oddech przed sekcją NAPIS */
}

.view-picker .mini-thumbnail {
  flex-shrink: 0;
  position: relative;
  margin-bottom: 18px;              /* przestrzeń pod miniaturą */
}

.view-picker .mini-thumbnail:focus-visible {
  outline: 2px solid #1f2937;
  outline-offset: 2px;
}

.view-switch {
  width: 100%;
  max-width: 236px;                 /* całość mniejsza i wyśrodkowana */
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  padding: 3px;
  background: rgba(17, 24, 39, 0.05);
  border-radius: 10px;
}

.view-switch__btn {
  border: none;
  background: transparent;
  color: #6b7280;
  padding: 6px 0;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}

.view-switch__btn:hover:not(.active) {
  color: #374151;
  background: rgba(255, 255, 255, 0.6);
}

.view-switch__btn.active {
  background: #1f2937;
  color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.view-switch__btn:focus-visible {
  outline: 2px solid #1f2937;
  outline-offset: 2px;
}
.view-picker .mini-thumbnail.mini-thumbnail-front,
.view-picker .mini-thumbnail.mini-thumbnail-flat {
  height: 190px;
}
</style>