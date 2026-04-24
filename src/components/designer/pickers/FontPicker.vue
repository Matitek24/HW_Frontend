<template>
    <div class="font-picker-wrapper" ref="pickerTrigger">
      <div class="font-trigger" @click.stop="togglePicker" :class="{ 'active': isOpen }">
        <span class="current-font-name" :style="{ fontFamily: modelValue }">
          {{ currentFontName }}
        </span>
        <span class="chevron-icon"></span>
      </div>
  
      <Teleport to="body">
        <Transition name="slide-fade">
          <div v-if="isOpen" 
               class="font-dropdown" 
               :style="dropdownStyle"
               ref="dropdownEl"
               @click.stop>
            
            <div class="font-dropdown-header">
              <span>WYBIERZ CZCIONKĘ</span>
              <button class="close-btn" @click="close">×</button>
            </div>
  
            <div class="font-options-list">
              <div 
                v-for="font in visibleOptions" 
                :key="font.id" 
                class="font-option"
                :class="{ selected: modelValue === font.wartosc }"
                :style="{ fontFamily: font.wartosc }"
                @click="selectFont(font.wartosc)"
                @mouseenter="handleMouseEnter(font.wartosc)"
                @mouseleave="!isClosing && emit('hover-end')"
              >
                {{ font.nazwa }}
                <span v-if="modelValue === font.wartosc" class="check-icon">✓</span>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
  
  const props = defineProps({
    modelValue: { type: String, required: true },
    options: { type: Array, default: () => [] },
    pickerId: { type: String, default: () => `fp-${Math.random().toString(36).substr(2, 9)}` }
  });

  const emit = defineEmits(['update:modelValue', 'hover', 'hover-end']);
  const visibleOptions = computed(() => {
  if (!props.options || !props.options.length) return [];
  
  return props.options.filter(option => {
    const text = JSON.stringify(option).toLowerCase();
    if (text.includes('calibri')) return false;
    return true;
  });
});
  const pickerTrigger = ref(null);
  const dropdownEl = ref(null);
  const isOpen = ref(false);
  const isClosing = ref(false); 
  const dropdownStyle = ref({});
  
  const currentFontName = computed(() => {
    const font = props.options.find(f => f.wartosc === props.modelValue);
    return font ? font.nazwa : 'Wybierz czcionkę';
  });
  
  const updatePosition = () => {
    if (!pickerTrigger.value) return;
    const rect = pickerTrigger.value.getBoundingClientRect();
    
    // Otwieranie nad paskiem (bottom)
    dropdownStyle.value = {
      position: 'fixed',
      bottom: `${window.innerHeight - rect.top + 8}px`,
      left: `${rect.left}px`,
      width: '220px',
      zIndex: 999999
    };
  };
  
  const togglePicker = async () => {
    if (isOpen.value) {
      close();
    } else {
      isOpen.value = true;
      await nextTick();
      updatePosition();
    }
  };
  
  const close = () => {
    if (isOpen.value) {
      isClosing.value = true; // Blokada!
      emit('hover-end');
      isOpen.value = false;
      // Reset flagi po zakończeniu animacji zamykania
      setTimeout(() => { isClosing.value = false; }, 300);
    }
  };
  
  const selectFont = (val) => {
    isClosing.value = true; // Natychmiastowa blokada podglądu
    emit('update:modelValue', val);
    emit('hover-end'); // Wymuszamy czysty podgląd (wskoczy realny config)
    close();
  };
  
  const handleMouseEnter = (fontVal) => {
    if (!isClosing.value) {
      emit('hover', fontVal);
    }
  };
  
  const handleClickOutside = (event) => {
    if (isOpen.value && !pickerTrigger.value.contains(event.target) && !dropdownEl.value?.contains(event.target)) {
      close();
    }
  };
  
  onMounted(() => {
    document.addEventListener('click', handleClickOutside, true);
    window.addEventListener('resize', updatePosition);
  });
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside, true);
  });
  </script>
  
  <style scoped>
  .font-picker-wrapper { position: relative; width: 100%; }
  
  .font-trigger {
    background: #f3f4f6;
    /* Dopasowane do .input-pill z Formularz.vue */
    padding: 8px 12px; 
    height: 42px; /* Stała wysokość jak w inputach */
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-width: 160px;
    border: 2px solid transparent;
    box-sizing: border-box;
    transition: all 0.2s;
  }
  
  .font-trigger:hover { background: #e5e7eb; }
  .font-trigger.active { border-color: #3b82f6; background: #fff; }
  
  .current-font-name { 
    font-size: 14px; 
    font-weight: 600; 
    color: #1f2937;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .font-dropdown {
    background: white;
    border-radius: 14px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
    padding: 8px;
  }
  
  .font-dropdown-header {
    padding: 4px 8px 8px 8px;
    font-size: 10px;
    font-weight: 800;
    color: #9ca3af;
    display: flex;
    justify-content: space-between;
    align-items: center; /* Wyśrodkowanie pionowe napisu i krzyżyka */
  }
  
  .font-options-list { max-height: 250px; overflow-y: auto; padding-right: 4px; }
  
  .font-option {
    padding: 10px 12px;
    font-size: 15px;
    cursor: pointer;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background 0.2s;
    margin-bottom: 2px;
  }
  
  .font-option:hover { background: #f3f4f6; }
  .font-option.selected { color: #3b82f6; background: rgba(59, 130, 246, 0.05); }
  
  .close-btn { 
    background: none; 
    border: none; 
    color: #9ca3af; 
    cursor: pointer; 
    font-size: 22px; 
    line-height: 1;
    padding: 0 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .close-btn:hover { color: #1f2937; }
  
  .check-icon { font-size: 12px; }
  
  .chevron-icon {
    width: 8px;
    height: 8px;
    border-right: 2px solid #9ca3af;
    border-bottom: 2px solid #9ca3af;
    transform: rotate(45deg);
    margin-left: 8px;
    margin-bottom: 4px;
  }
  
  .slide-fade-enter-active { transition: all 0.3s ease-out; }
  .slide-fade-leave-active { transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1); }
  .slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(10px); opacity: 0; }
  </style>