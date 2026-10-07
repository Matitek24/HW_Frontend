<template>
  <div class="section-wrapper" :class="{ 'expanded-column': !compact }">
    <div v-if="compact" class="group-section">
      <div class="group-header">{{ t('configurator.sections.hat_colors') }}</div>
      <div class="controls-row">
        <ColorControl
          v-for="part in hatParts"
          :key="part.key"
          :label="part.label"
          :color="config[part.key]"
          :colors="colors"
          :yarn-number="getYarnNumber(config[part.key])"
          :path="`base.${part.key}`"
          compact
          @update:color="updateColor(part.key, $event)"
          @hover="$emit('hover', $event)"
          @hover-end="$emit('hover-end')"
        />
      </div>
    </div>
    <template v-else>
      <h3 class="column-title">{{ t('configurator.sections.hat_colors') }}</h3>
      <div class="color-list-rows">
        <ColorControl
          v-for="part in hatParts"
          :key="part.key"
          :label="part.expandedLabel"
          :color="config[part.key]"
          :colors="colors"
          :path="`base.${part.key}`"
          @update:color="updateColor(part.key, $event)"
          @hover="$emit('hover', $event)"
          @hover-end="$emit('hover-end')"
        />
      </div>
    </template>
  </div>
</template>
  
  <script setup>
  import ColorControl from './ColorControls.vue';
  import { computed } from 'vue';
  import './styles/controls.css';
  import { useLanguage } from '../../../locales/useLanguage.js';

  const {t} = useLanguage();

  const props = defineProps({
    config: {
      type: Object,
      required: true
    },
    colors: {
      type: Array,
      default: () => []
    },
    getYarnNumber: {
      type: Function,
      required: true
    },
    compact: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['update:config', 'hover', 'hover-end']);
  
  const hatParts = computed(() => [
  {
    key: 'top',
    label: t('configurator.options.hat_top_short'),
    expandedLabel: t('configurator.options.hat_top')
  },
  {
    key: 'middle',
    label: t('configurator.options.hat_middle_short'),
    expandedLabel: t('configurator.options.hat_middle')
  },
  {
    key: 'bottom',
    label: t('configurator.sections.cuff').toUpperCase(),
    expandedLabel: t('configurator.sections.cuff')
  }
]);
  const updateColor = (part, color) => {
  emit('update:config', { [part]: color }); 
};
  </script>
  