<template>
  <div class="font-picker-wrapper" ref="pickerTrigger">
    <div class="font-trigger" :class="{ active: isOpen }" @click.stop="togglePicker">
      <span class="current-font-name" :style="{ fontFamily: current.family }">
        {{ current.label }}
      </span>
      <span class="chevron-icon"></span>
    </div>

    <Teleport to="body">
      <Transition name="fp-fade">
        <div v-if="isOpen" ref="dropdownEl" class="font-dropdown" :style="dropdownStyle" @click.stop>
          <div class="font-dropdown-header">
            <span>WYBIERZ CZCIONKĘ</span>
            <button class="close-btn" @click="close">×</button>
          </div>

          <div class="font-options-list" @mouseleave="onListLeave">
            <div
              v-for="item in items"
              :key="item.key"
              class="font-option"
              :class="{ selected: item.value === modelValue }"
              :style="{ fontFamily: item.family }"
              @click="selectFont(item.value)"
              @mouseenter="onEnter(item.value)"
            >
              {{ item.label }}
              <span v-if="item.value === modelValue" class="check-icon">✓</span>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useFontsStore } from '../../../utils/fonts/fontsStore';
import { loadFont } from '../../../utils/fonts/fontService';   // dostosuj ścieżkę

const props = defineProps({
  modelValue: { type: String, required: true },
  options: { type: Array, default: () => [] },
});
const emit = defineEmits(['update:modelValue', 'hover', 'hover-end']);

const fontsStore = useFontsStore();

// ---------- DANE ----------
// Jedna lista gotowa do wyświetlenia (liczona raz, nie przy każdym renderze)
const items = computed(() =>
  props.options
    .filter((o) => String(o.wartosc ?? '').toLowerCase() !== 'calibri')
    .map((o) => {
      const font = fontsStore.getFont(o.id ?? o.wartosc);
      return {
        key: o.id ?? o.wartosc,
        value: o.wartosc,
        label: o.nazwa || o.name || font.name,
        font,
        family: font.family,
      };
    })
);

const current = computed(() => {
  const item = items.value.find((i) => i.value === props.modelValue);
  if (item) return item;
  const font = fontsStore.getFont(props.modelValue);
  return { label: font.name || 'Wybierz czcionkę', font, family: font.family };
});

// ---------- ŁADOWANIE FONTÓW ----------
// Wybrany font ładujemy od razu, resztę po cichu w tle (po jednym, gdy przeglądarka jest bezczynna),
// żeby otwarcie listy nie musiało nic parsować.
watch(
  () => current.value.font,
  (font) => loadFont(font).catch(() => {}),
  { immediate: true }
);

const idle = (fn) =>
  'requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 2000 }) : setTimeout(fn, 200);

const queued = new Set();
const queue = [];
let running = false;
let alive = true;

const runQueue = async () => {
  running = true;
  while (queue.length && alive) {
    await new Promise((r) => idle(r));
    await loadFont(queue.shift()).catch(() => {});
  }
  running = false;
};

watch(
  items,
  (list) => {
    for (const i of list) {
      if (!queued.has(i.family)) {
        queued.add(i.family);
        queue.push(i.font);
      }
    }
    if (!running) runQueue();
  },
  { immediate: true }
);

// ---------- OTWIERANIE / POZYCJA ----------
const pickerTrigger = ref(null);
const dropdownEl = ref(null);
const isOpen = ref(false);
const isClosing = ref(false);
const dropdownStyle = ref({});

const GAP = 8, MARGIN = 12, CHROME = 56, WIDTH = 220;

const updatePosition = () => {
  if (!pickerTrigger.value) return;
  const r = pickerTrigger.value.getBoundingClientRect();
  const below = window.innerHeight - r.bottom - MARGIN;
  const above = r.top - MARGIN;
  const openDown = below >= 200 || below >= above;     // w dół, w górę tylko gdy brak miejsca
  const space = (openDown ? below : above) - GAP;

  dropdownStyle.value = {
    position: 'fixed',
    left: `${Math.max(MARGIN, Math.min(r.left, window.innerWidth - WIDTH - MARGIN))}px`,
    width: `${WIDTH}px`,
    zIndex: 999999,
    ...(openDown
      ? { top: `${r.bottom + GAP}px` }
      : { bottom: `${window.innerHeight - r.top + GAP}px` }),
    '--list-max': `${Math.max(120, Math.min(250, space - CHROME))}px`,
  };
};

// Maksymalnie jedna aktualizacja na klatkę
let rafId = 0;
const schedulePosition = () => {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    rafId = 0;
    updatePosition();
  });
};

// Nasłuchiwanie tylko, gdy lista jest otwarta
watch(isOpen, (open) => {
  if (open) {
    window.addEventListener('resize', schedulePosition);
    window.addEventListener('scroll', schedulePosition, true);
  } else {
    window.removeEventListener('resize', schedulePosition);
    window.removeEventListener('scroll', schedulePosition, true);
  }
});

const togglePicker = async () => {
  if (isOpen.value) return close();
  updatePosition();           // pozycja jeszcze przed pierwszym renderem, bez "skoku"
  isOpen.value = true;
  await nextTick();
};

// ---------- HOVER / WYBÓR ----------
let hoverTimer = null;

const onEnter = (val) => {
  if (isClosing.value) return;
  clearTimeout(hoverTimer);
   emit('hover', val);  
};

const onListLeave = () => {
  clearTimeout(hoverTimer);
  if (!isClosing.value) emit('hover-end');
};

const close = () => {
  if (!isOpen.value) return;
  clearTimeout(hoverTimer);
  isClosing.value = true;
  emit('hover-end');
  isOpen.value = false;
  setTimeout(() => { isClosing.value = false; }, 200);
};

const selectFont = (val) => {
  clearTimeout(hoverTimer);
  isClosing.value = true;
  emit('update:modelValue', val);
  emit('hover-end');
  close();
};

const handleClickOutside = (e) => {
  if (!isOpen.value) return;
  if (pickerTrigger.value?.contains(e.target) || dropdownEl.value?.contains(e.target)) return;
  close();
};

onMounted(() => document.addEventListener('click', handleClickOutside, true));

onUnmounted(() => {
  alive = false;
  clearTimeout(hoverTimer);
  cancelAnimationFrame(rafId);
  document.removeEventListener('click', handleClickOutside, true);
  window.removeEventListener('resize', schedulePosition);
  window.removeEventListener('scroll', schedulePosition, true);
});
</script>

<style scoped>
.font-picker-wrapper { position: relative; width: 100%; }

.font-trigger {
  background: #f3f4f6;
  padding: 8px 12px;
  height: 42px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 160px;
  border: 2px solid transparent;
  box-sizing: border-box;
  transition: background-color 0.15s, border-color 0.15s;
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
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
  padding: 8px;
  will-change: transform, opacity;
}

.font-dropdown-header {
  padding: 4px 8px 8px;
  font-size: 10px;
  font-weight: 800;
  color: #9ca3af;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.font-options-list {
  max-height: var(--list-max, 250px);
  overflow-y: auto;
  padding-right: 4px;
  overscroll-behavior: contain;
}

.font-option {
  padding: 10px 12px;
  font-size: 15px;
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
  transition: background-color 0.1s;
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

/* Tylko opacity + transform, krótko */
.fp-fade-enter-active { transition: opacity 0.15s ease-out, transform 0.15s ease-out; }
.fp-fade-leave-active { transition: opacity 0.1s ease-in; }
.fp-fade-enter-from { opacity: 0; transform: translateY(-6px); }
.fp-fade-leave-to { opacity: 0; }
</style>