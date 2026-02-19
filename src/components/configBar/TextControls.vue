<template>
    <div class="section-wrapper" :class="{ 'expanded-column': !compact }">
      <h3 v-if="!compact" class="column-title">Napis</h3>
  
      <!-- Compact View -->
      <div v-if="compact" class="group-section">
        <div class="group-header">PERSONALIZACJA</div>
        <div class="controls-row">
          <div class="control-item">
            <label class="mini-label">TWÓJ NAPIS / TEKST</label>
            <input
              type="text"
              :value="config.content"
              @input="updateField('content', $event.target.value)"
              class="input-pill text-main"
              placeholder="Twój tekst..."
              maxlength="50"
            />
          </div>
  
          <div class="control-item">
            <label class="mini-label">CZCIONKA</label>
            <FontPicker
              :model-value="config.font"
              :options="fonts"
              @update:model-value="updateField('font', $event)"
              @hover="(fontVal) => $emit('hover', { path: 'text.font', value: fontVal })"
              @hover-end="$emit('hover-end')"
            />
          </div>
  
          <div class="control-item">
            <label class="mini-label">KOLOR TEKSTU</label>
            <div class="color-pill">
              <ColorPicker
                :model-value="config.color"
                :color-options="colors"
                @update:model-value="updateField('color', $event)"
                @hover="(hex) => $emit('hover', { path: 'text.color', value: hex })"
                @hover-end="$emit('hover-end')"
                title="Kolor Tekstu"
              />
              <input
                type="text"
                :value="config.color"
                @input="updateField('color', $event.target.value)"
                class="hex-input"
                maxlength="7"
              />
            </div>
          </div>
        </div>
      </div>
  
      <!-- Expanded View -->
      <template v-else>
        <div class="expanded-field">
          <input
            type="text"
            :value="config.content"
            @input="updateField('content', $event.target.value)"
            class="input-pill full-width large-text"
            placeholder="Twój tekst..."
            maxlength="50"
          />
        </div>
  
        <div class="expanded-row">
          <div class="expanded-field half">
            <label>Czcionka</label>
            <div class="select-wrapper">
              <FontPicker
                :model-value="config.font"
                :options="fonts"
                @update:model-value="updateField('font', $event)"
                @hover="(fontVal) => $emit('hover', { path: 'text.font', value: fontVal })"
                @hover-end="$emit('hover-end')"
              />
            </div>
          </div>
  
          <div class="expanded-field half">
            <label>Kolor Tekstu</label>
            <div class="color-pill full-width space-between">
              <ColorPicker
                :model-value="config.color"
                :color-options="colors"
                @update:model-value="updateField('color', $event)"
                @hover="(hex) => $emit('hover', { path: 'text.color', value: hex })"
                @hover-end="$emit('hover-end')"
              />
              <span class="hex-display">{{ config.color }}</span>
            </div>
          </div>
        </div>
  
        <div class="expanded-row">
          <div class="expanded-field half">
            <label>Rozmiar: {{ (config.fontSize / 8) }} px</label>
            <input
              type="range"
              :value="config.fontSize"
              @input="updateField('fontSize', Number($event.target.value))"
              min="48"
              max="152"
              step="8"
              class="slider compact-slider"
            />
          </div>
  
          <div class="expanded-field half">
            <label>Pozycja Y: {{ (config.offsetY / 6).toFixed(1) }} px</label>
            <input
              type="range"
              :value="config.offsetY"
              @input="updateField('offsetY', Number($event.target.value))"
              min="-60"
              max="60"
              step="6"
              class="slider compact-slider"
            />
          </div>
        </div>
      </template>
    </div>
  </template>
  
  <script setup>
  import ColorPicker from '../utils/ColorPicker.vue';
  import FontPicker from '../utils/FontPicker.vue';
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
    fonts: {
      type: Array,
      default: () => []
    },
    compact: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['update:config', 'hover', 'hover-end']);
  
  const updateField = (field, value) => {
  emit('update:config', { [field]: value }); 
};
  </script>
  
  