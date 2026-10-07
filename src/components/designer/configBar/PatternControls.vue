<template>
  <div class="section-wrapper" :class="{ 'expanded-column': !compact }">
    <div v-if="compact" class="group-section">
      <div class="group-header">{{ t('configurator.sections.patterns') }}</div>

      <!-- Wzór Góra -->
      <div class="controls-row compact-gap">
        <div class="mini-color-stack" :title="t('configurator.options.main_pattern')">
          <ColorPicker
            :model-value="patternColors.top"
            :color-options="colors"
            @update:model-value="updatePatternColor('top', $event)"
            @hover="(hex) => $emit('hover', { path: 'pattern.top', value: hex })"
            @hover-end="$emit('hover-end')"
            :title="t('configurator.options.pattern_top_color')"
          />
        </div>
        <div class="select-wrapper w-100">
          <PatternPicker
            :model-value="patterns.top"
            :options="topPatterns"
            @update:model-value="updatePattern('top', $event)"
            :title="t('configurator.options.pick_pattern_top')"
          />
        </div>
      </div>

      <!-- Wzór Środek -->
      <div class="controls-row compact-gap">
        <div class="mini-color-stack" :title="t('configurator.options.main_pattern')">
          <ColorPicker
            :model-value="patternColors.main"
            :color-options="colors"
            @update:model-value="updatePatternColor('main', $event)"
            @hover="(hex) => $emit('hover', { path: 'pattern.main', value: hex })"
            @hover-end="$emit('hover-end')"
            :title="t('configurator.options.pattern_bottom_color')"
          />
        </div>
        <div class="select-wrapper w-100">
          <PatternPicker
            :model-value="patterns.bottom"
            :options="bottomPatterns"
            @update:model-value="updatePattern('bottom', $event)"
            :title="t('configurator.options.pick_pattern_bottom')"
          />
        </div>
      </div>
    </div>

    <template v-else>
      <h3 class="column-title">{{ t('configurator.sections.patterns') }}</h3>

      <!-- Wzór Góra -->
      <div class="expanded-row">
        <div class="expanded-field grow">
          <label>{{ t('configurator.options.pattern_top') }}</label>
          <PatternPicker
            :model-value="patterns.top"
            :options="topPatterns"
            @update:model-value="updatePattern('top', $event)"
            :opt="true"
          />
        </div>
        <div class="expanded-field auto-width">
          <label>{{ t('configurator.options.color') }}</label>
          <ColorPicker
            :model-value="patternColors.top"
            :color-options="colors"
            @update:model-value="updatePatternColor('top', $event)"
            @hover="(hex) => $emit('hover', { path: 'pattern.top', value: hex })"
            @hover-end="$emit('hover-end')"
          />
        </div>
      </div>

      <!-- Wzór Środek -->
      <div class="expanded-row mt-2">
        <div class="expanded-field grow">
          <label>{{ t('configurator.options.pattern_middle') }}</label>
          <PatternPicker
            :model-value="patterns.bottom"
            :options="bottomPatterns"
            @update:model-value="updatePattern('bottom', $event)"
            :opt="true"
          />
        </div>
        <div class="expanded-field auto-width">
          <label>{{ t('configurator.options.color') }}</label>
          <ColorPicker
            :model-value="patternColors.main"
            :color-options="colors"
            @update:model-value="updatePatternColor('main', $event)"
            @hover="(hex) => $emit('hover', { path: 'pattern.main', value: hex })"
            @hover-end="$emit('hover-end')"
          />
        </div>
      </div>
    </template>
  </div>
</template>

  
  <script setup>
  import ColorPicker from '../pickers/ColorPicker.vue';
  import PatternPicker from '../pickers/PatternPicker.vue';
  import './styles/controls.css';
  import { useLanguage } from '../../../locales/useLanguage.js';

  const {t} = useLanguage();


  const props = defineProps({
    patternColors: {
      type: Object,
      required: true
    },
    patterns: {
      type: Object,
      required: true
    },
    colors: {
      type: Array,
      default: () => []
    },
    topPatterns: {
      type: Array,
      default: () => []
    },
    bottomPatterns: {
      type: Array,
      default: () => []
    },
    compact: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['update:pattern-colors', 'update:patterns', 'hover', 'hover-end']);
  
  const updatePatternColor = (key, value) => {
    emit('update:pattern-colors', { ...props.patternColors, [key]: value });
  };
  
  const updatePattern = (key, value) => {
    emit('update:patterns', { ...props.patterns, [key]: value });
  };
  </script>
