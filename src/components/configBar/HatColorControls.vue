<template>
    <div class="section-wrapper" :class="{ 'expanded-column': !compact }">
      <div v-if="compact" class="group-section">
        <div class="group-header">KOLORY CZAPKI</div>
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
        <h3 class="column-title">Kolory Czapki</h3>
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
  
  const hatParts = [
    { key: 'top', label: 'GÓRA', expandedLabel: 'Góra Czapki' },
    { key: 'middle', label: 'ŚRODEK', expandedLabel: 'Środek Czapki' },
    { key: 'bottom', label: 'WYWINIĘCIE', expandedLabel: 'Wywinięcie' }
  ];
  
  const updateColor = (part, color) => {
  emit('update:config', { [part]: color }); 
};
  </script>
  