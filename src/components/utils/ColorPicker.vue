<template>
  <div class="color-picker-wrapper" ref="pickerTrigger">
    <div 
      class="color-ring clickable" 
      :style="{ backgroundColor: modelValue }" 
      @click.stop="togglePicker"
    >
      <div class="floating-tooltip main-trigger-tooltip">{{ getActiveColorName }}</div>
    </div>

    <Teleport to="body">
      <transition name="fade">
        <div 
          v-if="isOpen" 
          :class="isMobile ? 'color-dropdown-fixed' : 'color-dropdown-absolute'"
          :style="dropdownStyle" 
          ref="dropdownEl" 
          @click.stop
        >
          <div class="color-dropdown-header">
            <span>{{ label || title || 'WYBIERZ KOLOR' }}</span>
            <button class="close-btn" @click="close">×</button>
          </div>

          <div class="color-dropdown-grid" ref="gridEl">
            <div 
              v-for="(color, index) in colorOptions" 
              :key="color.id" 
              class="color-dropdown-swatch"
              :style="{ backgroundColor: color.hex }"
              @click="selectColor(color.hex)"
              @mouseenter="(e) => handleSwatchHover(color, index, e)" 
              @mouseleave="handleSwatchLeave"
              :class="{ active: modelValue === color.hex }"
            >
              </div>
          </div>

          <div 
            v-if="hoveredColor" 
            class="floating-tooltip shared-tooltip" 
            :class="{ 'is-bottom': tooltipIsBottom }"
            :style="sharedTooltipStyle"
          >
            <span class="tooltip-name">{{ hoveredColor.nazwa }}</span>
            <span class="tooltip-index">#{{ hoveredColorIndex + 1 }}</span>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script>
import { ref } from 'vue';
const activePickerId = ref(null);

export default {
  name: 'ColorPicker'
}
</script>

<script setup>
import { onMounted, onUnmounted, computed, nextTick, ref, reactive } from 'vue';

const props = defineProps({
  modelValue: { type: String, required: true },
  colorOptions: { type: Array, default: () => [] },
  label: { type: String, default: '' },
  title: { type: String, default: '' },
  pickerId: { type: String, default: () => `cp-${Math.random().toString(36).substr(2, 9)}` }
});

const emit = defineEmits(['update:modelValue', 'hover', 'hover-end']);

// --- REFS & STATE ---
const pickerTrigger = ref(null); 
const dropdownEl = ref(null);
const isClosing = ref(false);

const isMobile = ref(window.innerWidth <= 768);
const dropdownStyle = ref({});
const isOpen = computed(() => activePickerId.value === props.pickerId);

// Shared Tooltip State
const hoveredColor = ref(null);
const hoveredColorIndex = ref(null);
const tooltipIsBottom = ref(false);
const sharedTooltipStyle = reactive({ 
  top: '0px', 
  left: '0px', 
  opacity: 0,
  transform: 'translate(-50%, -100%)' // Domyślna pozycja startowa
});

// --- HELPERS ---
const getActiveColorName = computed(() => {
  const activeColor = props.colorOptions.find(c => c.hex === props.modelValue);
  return activeColor ? activeColor.nazwa : props.modelValue;
});

// --- CORE LOGIC ---

// Obliczanie pozycji okna (Fixed positioning dla Teleportu)
const updatePosition = () => {
  if (!pickerTrigger.value || !isOpen.value) return;
  
  const rect = pickerTrigger.value.getBoundingClientRect();
  const dropdownWidth = 240;
  
  // Centrowanie względem guzika
  let left = rect.left + (rect.width / 2) - (dropdownWidth / 2);
  let top = rect.top - 310; // Domyślnie nad guzikiem

  // Marginesy ekranu
  const margin = 10;
  if (left < margin) left = margin;
  if (left + dropdownWidth > window.innerWidth - margin) {
    left = window.innerWidth - dropdownWidth - margin;
  }

  // Jeśli brak miejsca u góry, pokaż pod spodem
  if (top < margin) {
    top = rect.bottom + 10;
  }

  dropdownStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    width: `${dropdownWidth}px`,
    zIndex: 999999
  };
};

const togglePicker = async () => {
  if (isOpen.value) {
    close();
  } else {
    activePickerId.value = props.pickerId;
    await nextTick();
    updatePosition();
  }
};

const close = () => {
  if (activePickerId.value === props.pickerId) {
    isClosing.value = true; 
    emit('hover-end');
    activePickerId.value = null;
        setTimeout(() => {
      isClosing.value = false;
    }, 300);
  }
};

const selectColor = (hex) => {
  isClosing.value = true; 
  emit('update:modelValue', hex);
  emit('hover-end');
  close();
};
// --- TOOLTIP LOGIC ---

const handleSwatchHover = async (color, index, event) => {
  if(isClosing.value) return;
  hoveredColor.value = color;
  hoveredColorIndex.value = index;
  emit('hover', color.hex);

  await nextTick();
  if (!dropdownEl.value) return;

  const swatch = event.currentTarget;
  const dropdownRect = dropdownEl.value.getBoundingClientRect();
  const swatchRect = swatch.getBoundingClientRect();

  let left = swatchRect.left - dropdownRect.left + (swatchRect.width / 2);
  let top = swatchRect.top - dropdownRect.top;
  if (top < 40) {
    tooltipIsBottom.value = true;
    top = swatchRect.bottom - dropdownRect.top + 8;
  } else {
    tooltipIsBottom.value = false;
    top = top - 8; 
  }

  sharedTooltipStyle.left = `${left}px`;
  sharedTooltipStyle.top = `${top}px`;
  sharedTooltipStyle.opacity = 1;
};

const handleSwatchLeave = () => {
  hoveredColor.value = null;
  sharedTooltipStyle.opacity = 0;
  emit('hover-end');
};

// --- EVENTS ---

const handleClickOutside = (event) => {
  if (!isOpen.value) return;
  const target = event.target;
  if (dropdownEl.value?.contains(target) || pickerTrigger.value?.contains(target)) {
    return;
  }
  close();
};

const handleResizeOrScroll = () => {
  isMobile.value = window.innerWidth <= 768;
  if (isOpen.value) updatePosition();
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true);
  window.addEventListener('resize', handleResizeOrScroll);
  window.addEventListener('scroll', handleScroll, true);
});

// Fix na scroll event (throttling niepotrzebny przy fixed, ale capture ważne)
const handleScroll = () => { if(isOpen.value) updatePosition(); };

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true);
  window.removeEventListener('resize', handleResizeOrScroll);
  window.removeEventListener('scroll', handleScroll, true);
});
</script>

<style scoped>
/* WRAPPER */
.color-picker-wrapper { position: relative; display: inline-block; vertical-align: middle; }

/* TRIGGER (GŁÓWNY GUZIK) */
.color-ring.clickable {
  cursor: pointer; 
  width: 32px; 
  height: 32px; 
  border-radius: 50%;
  border: 2px solid #fff; 
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  display: flex; 
  align-items: center; 
  justify-content: center;
  transition: transform 0.2s ease;
}
.color-ring.clickable:hover { transform: scale(1.05); }

/* TRIGGER TOOLTIP (Ten biały nad guzikiem) */
.main-trigger-tooltip {
  position: absolute;
  bottom: 130%; left: 50%;
  transform: translateX(-50%);
  background: #ffffff; 
  color: #1f2937; 
  border: 1px solid #e5e7eb;
  padding: 5px 10px; 
  border-radius: 6px;
  font-size: 10px; 
  font-weight: 700;
  white-space: nowrap; 
  pointer-events: none;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  opacity: 0; 
  transition: opacity 0.2s, transform 0.2s;
}
.color-ring:hover .main-trigger-tooltip { opacity: 1; transform: translateX(-50%) translateY(-5px); }
.main-trigger-tooltip::after {
  content: ''; position: absolute; top: 100%; left: 50%;
  transform: translateX(-50%);
  border-width: 5px; border-style: solid;
  border-color: #ffffff transparent transparent transparent;
}

/* DROPDOWN (OKNO) */
.color-dropdown-absolute, .color-dropdown-fixed {
  background: #ffffff;
  border-radius: 12px; /* Lekko mniejsze zaokrąglenie */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.05);
  padding: 12px;
  z-index: 999999;
  /* Fixed height/width logic handled in JS */
}

/* NAGŁÓWEK DROPDOWNU */
.color-dropdown-header {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 8px; margin-bottom: 8px; 
  border-bottom: 1px solid #f1f3f5;
}
.color-dropdown-header span { 
  font-size: 11px; font-weight: 700; color: #9ca3af; letter-spacing: 0.5px; 
}
.close-btn { 
  background: none; border: none; font-size: 18px; line-height: 1;
  cursor: pointer; color: #adb5bd; padding: 0 4px;
}
.close-btn:hover { color: #495057; }

/* GRID KOLORÓW */
.color-dropdown-grid {
  display: grid; 
  grid-template-columns: repeat(5, 1fr); 
  gap: 6px; /* Mniejszy odstęp dla zwartości */
  max-height: 260px; 
  overflow-y: auto; 
  overflow-x: hidden;
  padding: 2px; /* Margines na focus ring */
}

/* SWATCH (GUZIK KOLORU W PALECIE) */
.color-dropdown-swatch {
  width: 30px; /* ZMNIEJSZONE z 36px */
  height: 30px; /* ZMNIEJSZONE z 36px */
  border-radius: 50%; 
  cursor: pointer;
  border: 1px solid rgba(0,0,0,0.05); 
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  transition: transform 0.1s ease, box-shadow 0.1s ease;
  position: relative;
}
.color-dropdown-swatch:hover {
  transform: scale(1.15);
  z-index: 10;
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}
.color-dropdown-swatch.active {
  box-shadow: 0 0 0 2px #3b82f6, 0 0 0 4px #fff; /* Niebieski pierścień aktywności */
  z-index: 5;
}

/* SHARED TOOLTIP (CIEMNY DYMEK W PALECIE) */
.shared-tooltip {
  position: absolute;
  /* Ciemny styl, który chciałeś */
  background: #1f2937; /* Ciemny grafit/antracyt */
  color: #ffffff;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1000000;
  
  /* Transformacja */
  transform: translateX(-50%) translateY(-100%);
  transition: opacity 0.1s ease, transform 0.1s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

/* Wariant pod spodem */
.shared-tooltip.is-bottom {
  transform: translateX(-50%) translateY(0);
}

/* Strzałka dla ciemnego dymka */
.shared-tooltip::after {
  content: ''; position: absolute; top: 100%; left: 50%;
  transform: translateX(-50%);
  border-width: 4px; border-style: solid;
  border-color: #1f2937 transparent transparent transparent;
}
.shared-tooltip.is-bottom::after {
  bottom: 100%; top: auto;
  border-color: transparent transparent #1f2937 transparent;
}

/* STYL TREŚCI W DYMKU */
.tooltip-name { display: block; text-transform: uppercase; line-height: 1.2; }
.tooltip-index { display: block; font-size: 8px; color: #9ca3af; margin-top: 1px; font-weight: 400; }

/* TRANSITIONS */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>