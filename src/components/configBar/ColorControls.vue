<template>
    <!-- Compact Version -->
    <div v-if="compact" class="control-item">
      <div class="unit-header">
        <label class="mini-label">{{ label }}</label>
      </div>
      <div class="picker-container">
        <ColorPicker
          :model-value="color"
          :color-options="colors"
          @update:model-value="$emit('update:color', $event)"
          @hover="(hex) => $emit('hover', { path, value: hex })"
          @hover-end="$emit('hover-end')"
          :title="label"
        />
        <span v-if="yarnNumber" class="yarn-number">{{ yarnNumber }}</span>
      </div>
    </div>
  
    <!-- Expanded Version -->
    <div v-else class="color-row-item">
      <span class="label-text">{{ label }}</span>
      <ColorPicker
        :model-value="color"
        :color-options="colors"
        @update:model-value="$emit('update:color', $event)"
        @hover="(hex) => $emit('hover', { path, value: hex })"
        @hover-end="$emit('hover-end')"
      />
    </div>
  </template>
  
  <script setup>
  import ColorPicker from '../utils/ColorPicker.vue';
  import './styles/controls.css';

  defineProps({
    label: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    },
    colors: {
      type: Array,
      default: () => []
    },
    path: {
      type: String,
      required: true
    },
    yarnNumber: {
      type: String,
      default: ''
    },
    compact: {
      type: Boolean,
      default: false
    }
  });
  
  defineEmits(['update:color', 'hover', 'hover-end']);
  </script>
  
