<template>
    <div class="config-bar-container" :class="{ 'expanded': isExpanded }">
      <!-- Toggle Button -->
      <div class="toggle-wrapper" @click="toggleExpand">
        <div class="toggle-btn">
          <span class="chevron" :class="{ 'up': !isExpanded, 'down': isExpanded }"></span>
        </div>
      </div>
  
      <div class="config-bar">
        <!-- Compact View -->
        <div v-if="!isExpanded" class="view-compact">
          <TextControls
            :config="config.text"
            :colors="dictionaries.colors"
            :fonts="dictionaries.fonts"
            compact
            @update:config="updateConfig('text', $event)"
            @hover="$emit('hover', $event)"
            @hover-end="$emit('hover-end')"
          />
  
          <div class="vertical-divider"></div>
  
          <HatColorControls
            :config="config.base"
            :colors="dictionaries.colors"
            :get-yarn-number="getYarnNumber"
            compact
            @update:config="updateConfig('base', $event)"
            @hover="$emit('hover', $event)"
            @hover-end="$emit('hover-end')"
          />
  
          <div class="vertical-divider"></div>
  
          <PatternControls
            :pattern-colors="config.pattern"
            :patterns="config.patterns"
            :colors="dictionaries.colors"
            :top-patterns="topPatterns"
            :bottom-patterns="bottomPatterns"
            compact
            @update:pattern-colors="updateConfig('pattern', $event)"
            @update:patterns="updateConfig('patterns', $event)"
            @hover="$emit('hover', $event)"
            @hover-end="$emit('hover-end')"
          />
  
          <div class="vertical-divider"></div>
  
          <PomponControls
            :config="config.pompons"
            :colors="dictionaries.colors"
            compact
            @update:config="updateConfig('pompons', $event)"
            @hover="$emit('hover', $event)"
            @hover-end="$emit('hover-end')"
          />
        </div>
  
        <!-- Footer Info (Compact) -->
        <FooterInfo v-if="!isExpanded" />
  
        <!-- Expanded View -->
        <div v-if="isExpanded" class="view-expanded">
          <div class="expanded-grid">
            <TextControls
              :config="config.text"
              :colors="dictionaries.colors"
              :fonts="dictionaries.fonts"
              @update:config="updateConfig('text', $event)"
              @hover="$emit('hover', $event)"
              @hover-end="$emit('hover-end')"
            />
  
            <HatColorControls
              :config="config.base"
              :colors="dictionaries.colors"
              :get-yarn-number="getYarnNumber"
              @update:config="updateConfig('base', $event)"
              @hover="$emit('hover', $event)"
              @hover-end="$emit('hover-end')"
            />
  
            <PatternControls
              :pattern-colors="config.pattern"
              :patterns="config.patterns"
              :colors="dictionaries.colors"
              :top-patterns="topPatterns"
              :bottom-patterns="bottomPatterns"
              @update:pattern-colors="updateConfig('pattern', $event)"
              @update:patterns="updateConfig('patterns', $event)"
              @hover="$emit('hover', $event)"
              @hover-end="$emit('hover-end')"
            />
  
            <PomponControls
              :config="config.pompons"
              :colors="dictionaries.colors"
              @update:config="updateConfig('pompons', $event)"
              @hover="$emit('hover', $event)"
              @hover-end="$emit('hover-end')"
            />
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
  
  const emit = defineEmits(['toggle-expand', 'hover', 'hover-end', 'update:config']);
  
  const isExpanded = ref(false);
  
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
  
  // Zwracamy format: "Nazwa / Numer" (index + 1, żeby nie zaczynać od 0)
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
    max-width: 1200px;
    padding: 20px 30px;
    margin: 0 auto;
    border-radius: 24px 24px 0 0;
  }
  
  /* --- WIDOK KOMPAKTOWY --- */
  .view-compact {
    display: flex;
    align-items: center;
    gap: 24px;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
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
    grid-template-columns: 1.2fr 1fr 1fr 0.8fr;
    gap: 24px;
  }
  
  /* --- RESPONSIVE --- */
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
  
  @media (max-width: 600px) {
    .view-compact {
      gap: 10px;
      padding: 0 5px;
      justify-content: center;
      width: 100%;
    }
  
    .view-compact > *:not(:first-child):not(.vertical-divider) {
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
  
    .toggle-wrapper {
      top: -35px;
    }
  
    .toggle-btn {
      height: 35px;
      width: 50px;
    }
  }
  </style>