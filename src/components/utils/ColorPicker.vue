<template>
  <div class="color-picker-wrapper" ref="pickerTrigger">
    
    <div 
      class="color-ring clickable" 
      :style="{ backgroundColor: modelValue }"
      @click.stop="togglePicker"
      :title="title"
    >
      <span v-if="selectedIndex !== -1" class="trigger-number">
        {{ selectedIndex + 1 }}
      </span>
    </div>

    <Teleport to="body" :disabled="!isMobile">
      <transition name="fade">
        <div 
          v-if="isOpen" 
          :class="isMobile ? 'color-dropdown-fixed' : 'color-dropdown-absolute'" 
          :style="isMobile ? dropdownStyle : {}"
          ref="dropdownEl"
          @click.stop
        >
          <div class="color-dropdown-header">
            <span>{{ label || title || 'Wybierz kolor' }}</span>
            <button class="close-btn" @click="close">×</button>
          </div>
          
          <div class="color-dropdown-grid">
            <div 
              v-for="(color, index) in colorOptions" 
              :key="color.id" 
              class="color-dropdown-swatch" 
              :style="{ backgroundColor: color.hex }" 
              @click="selectColor(color.hex)"
              :class="{ active: modelValue === color.hex }"
            >
              <span class="color-number">{{ index + 1 }}</span>

              <svg v-if="modelValue === color.hex" class="checkmark-icon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
               </svg>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, computed, nextTick, ref } from 'vue';

// Stan globalny dla aktywnego pickera (żeby zamykać inne przy otwieraniu)
// Jeśli masz to w osobnym pliku store, zaimportuj stamtąd. Tu wersja lokalna dla pliku:
const activePickerId = ref(null); 

const props = defineProps({
  modelValue: { type: String, required: true },
  colorOptions: { type: Array, default: () => [] },
  label: { type: String, default: '' },
  title: { type: String, default: '' },
  pickerId: { type: String, default: () => `cp-${Math.random().toString(36).substr(2, 9)}` }
});

const emit = defineEmits(['update:modelValue']);
const pickerTrigger = ref(null);
const dropdownEl = ref(null);
const dropdownStyle = ref({});
const isMobile = ref(window.innerWidth <= 768);

const isOpen = computed(() => activePickerId.value === props.pickerId);

// OBLICZANIE INDEKSU (Czy to 1, 5 czy 10 kolor z listy)
const selectedIndex = computed(() => {
  return props.colorOptions.findIndex(c => c.hex === props.modelValue);
});

// --- LOGIKA POZYCJONOWANIA ---
const updatePosition = () => {
  if (!isMobile.value || !pickerTrigger.value || !isOpen.value) return;
  const rect = pickerTrigger.value.getBoundingClientRect();
  const dropdownWidth = 240; 
  
  let left = rect.left + (rect.width / 2) - (dropdownWidth / 2);
  let top = rect.top - 310; // Wysokość dropdownu + margines

  if (left < 10) left = 10; 
  if (left + dropdownWidth > window.innerWidth - 10) {
    left = window.innerWidth - dropdownWidth - 10; 
  }
  if (top < 10) top = rect.bottom + 10;

  dropdownStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    width: `${dropdownWidth}px`
  };
};

const togglePicker = async () => {
  if (isOpen.value) {
    close();
  } else {
    activePickerId.value = props.pickerId;
    await nextTick();
    if (isMobile.value) updatePosition();
  }
};

const close = () => {
  if (isOpen.value) activePickerId.value = null;
};

const selectColor = (hex) => {
  emit('update:modelValue', hex);
  close();
};

const handleClickOutside = (event) => {
  if (!isOpen.value) return;
  const isClickInDropdown = dropdownEl.value && dropdownEl.value.contains(event.target);
  const isClickInTrigger = pickerTrigger.value && pickerTrigger.value.contains(event.target);
  if (!isClickInDropdown && !isClickInTrigger) close();
};

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
  if (isOpen.value && isMobile.value) updatePosition();
};

const handleScroll = () => {
  if (isOpen.value && isMobile.value) updatePosition();
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleScroll, true);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleScroll, true);
  if (isOpen.value) activePickerId.value = null;
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
  width: 32px; 
  height: 32px; 
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: transform 0.1s;
  
  /* Ważne dla pozycjonowania numerka */
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.color-ring.clickable:hover { transform: scale(1.1); }

/* --- NOWE: STYL NUMERKA W FORMULARZU (TRIGGER) --- */
.trigger-number {
  color: #fff;
  
  /* Mały i lekki font */
  font-size: 11px;
  font-weight: 500; /* Regular/Medium, nie Bold */
  
  /* Minimalny cień, żeby było widać na jasnym tle, ale bez "brudu" */
  text-shadow: 0 1px 2px rgba(0,0,0,0.4); 
  
  opacity: 0; 
  transition: opacity 0.2s ease; /* Szybkie, lekkie przejście */
  pointer-events: none;
  user-select: none;
}

/* Pojawia się po najechaniu */
.color-ring:hover .trigger-number {
  opacity: 1;
}

/* --- Reszta stylów bez zmian --- */
.color-dropdown-fixed {
  position: fixed; background: #ffffff; border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05); padding: 12px; z-index: 99999; 
}
.color-dropdown-absolute {
  position: absolute; bottom: calc(100% + 10px); left: 50%; transform: translateX(-50%);
  background: #ffffff; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
  padding: 12px; z-index: 20000; min-width: 240px;
}
.color-dropdown-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; margin-bottom: 8px; border-bottom: 1px solid #f3f4f6; }
.color-dropdown-header span { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; }
.close-btn { background: none; border: none; font-size: 20px; color: #9ca3af; cursor: pointer; padding: 0; line-height: 1; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 4px; }
.close-btn:hover { background: #f3f4f6; }

.color-dropdown-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; max-height: 280px; overflow-y: auto; padding-right: 8px; }
.color-dropdown-swatch { width: 32px; height: 32px; border-radius: 50%; cursor: pointer; border: 2px solid #fff; box-shadow: 0 0 0 1px #e5e7eb; position: relative; display: flex; align-items: center; justify-content: center; }
.color-dropdown-swatch.active { box-shadow: 0 0 0 2px #3b82f6, 0 0 0 4px #fff; }

/* Styl numerka w dropdownie (też odchudzony) */
.color-number {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%) scale(0.9);
  
  font-size: 12px; /* Też trochę mniejszy */
  font-weight: 500;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.4); 
  
  opacity: 0; 
  pointer-events: none;
  z-index: 2;
  transition: opacity 0.3s ease, transform 0.3s ease; 
}
.color-dropdown-swatch:hover .color-number { opacity: 1; transform: translate(-50%, -50%) scale(1); }

.checkmark-icon { width: 16px; height: 16px; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3)); transition: opacity 0.3s ease; }
.color-dropdown-swatch.active:hover .checkmark-icon { opacity: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>