<template>
    <div class="color-picker-wrapper" ref="pickerContainer">
      
      <div 
        class="color-ring clickable" 
        :style="{ backgroundColor: modelValue }"
        @click.stop="togglePicker"
        :title="title"
      ></div>
  
      <transition name="slide-fade">
        <div 
          v-if="isOpen" 
          class="color-dropdown" 
          @click.stop
        >
          <div class="color-dropdown-header">
            <span>{{ label || title || 'Wybierz kolor' }}</span>
            <button class="close-btn" @click="close">×</button>
          </div>
          
          <div class="color-dropdown-grid">
            <div 
              v-for="color in colorOptions" 
              :key="color.id" 
              class="color-dropdown-swatch" 
              :style="{ backgroundColor: color.hex }" 
              :title="color.nazwa"
              @click="selectColor(color.hex)"
              :class="{ active: modelValue === color.hex }"
            >
              <svg v-if="modelValue === color.hex" class="checkmark-icon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
               </svg>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  
  // To jest "singleton" - jedna zmienna dla wszystkich ColorPickerów na stronie
  const activePickerId = ref(null);
  </script>
  
  <script setup>
  import { onMounted, onUnmounted, computed } from 'vue';
  
  const props = defineProps({
    modelValue: { type: String, required: true },
    colorOptions: { type: Array, default: () => [] },
    label: { type: String, default: '' },
    title: { type: String, default: '' },
    // Generujemy unikalne ID, jeśli nie podano
    pickerId: { type: String, default: () => `cp-${Math.random().toString(36).substr(2, 9)}` }
  });
  
  const emit = defineEmits(['update:modelValue']);
  const pickerContainer = ref(null);
  
  // Czy TEN picker jest otwarty? Sprawdzamy globalne ID
  const isOpen = computed(() => activePickerId.value === props.pickerId);
  
  const togglePicker = () => {
    if (isOpen.value) {
      close();
    } else {
      // Otwierając ten, automatycznie nadpisujemy ID, co zamknie inne (dzięki computed)
      activePickerId.value = props.pickerId;
    }
  };
  
  const close = () => {
    if (isOpen.value) {
      activePickerId.value = null;
    }
  };
  
  const selectColor = (hex) => {
    emit('update:modelValue', hex);
    close();
  };
  
  // Zamykanie przy kliknięciu na zewnątrz
  const handleClickOutside = (event) => {
    if (isOpen.value && pickerContainer.value && !pickerContainer.value.contains(event.target)) {
      close();
    }
  };
  
  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
  });
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
    // Jeśli niszczymy komponent, który był otwarty, czyścimy stan
    if (isOpen.value) {
      activePickerId.value = null;
    }
  });
  </script>
  
  <style scoped>
  .color-picker-wrapper {
    position: relative;
    display: inline-block;
    vertical-align: middle;
  }
  
  .color-ring.clickable {
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    width: 32px; 
    height: 32px; 
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }
  
  .color-ring.clickable:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
  
  .color-dropdown {
    position: absolute;
    /* Pozycjonowanie względem wrappera */
    bottom: calc(100% + 10px); 
    left: 50%;
    transform: translateX(-50%); /* Centrowanie względem kółka */
    
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
    padding: 12px;
    z-index: 9999; /* Musi być wyżej niż inne elementy */
    min-width: 220px;
  }
  
  .color-dropdown-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 8px;
    margin-bottom: 8px;
    border-bottom: 1px solid #f3f4f6;
  }
  
  .color-dropdown-header span {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 20px;
    color: #9ca3af;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    width: 20px;
    height: 20px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 4px;
  }
  .close-btn:hover { background: #f3f4f6; color: #374151; }
  
  .color-dropdown-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 6px;
  }
  
  .color-dropdown-swatch {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid #fff;
    box-shadow: 0 0 0 1px #e5e7eb;
    transition: transform 0.1s;
    position: relative;
    display: flex; align-items: center; justify-content: center;
  }
  
  .color-dropdown-swatch:hover {
    transform: scale(1.15);
    z-index: 2;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }
  
  .color-dropdown-swatch.active {
    box-shadow: 0 0 0 2px #3b82f6, 0 0 0 4px #fff;
  }
  
  .checkmark-icon {
    width: 16px;
    height: 16px;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
  }
  
  /* Animacje wejścia */
  .slide-fade-enter-active { transition: all 0.2s ease-out; }
  .slide-fade-leave-active { transition: all 0.15s ease-in; }
  .slide-fade-enter-from, .slide-fade-leave-to {
    transform: translateX(-50%) translateY(10px);
    opacity: 0;
  }
  
  /* Dostosowanie mobilne */
  @media (max-width: 768px) {
    .color-dropdown {
      /* Na mobile może warto pozycjonować bardziej bezpiecznie */
      left: 0;
      transform: translateX(-20%); /* Lekka korekta, żeby nie uciekło z ekranu */
    }
  }
  </style>