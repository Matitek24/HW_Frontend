<template>
    <div class="status-badge-wrapper" ref="triggerRef">
      <div 
        class="status-trigger" 
        :class="statusClass"
        @click.stop="toggleDropdown"
      >
        <span v-if="isLoading" class="spinner-border spinner-border-sm me-1"></span>
        {{ currentLabel }}
        <svg class="ms-1" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" :class="{ 'rotate-180': isOpen }">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
  
      <Teleport to="body">
        <Transition name="fade">
          <div 
            v-if="isOpen" 
            class="status-menu-fixed"
            :style="menuPosition"
            v-click-outside="closeDropdown" 
            @click.stop
          >
            <div 
              v-for="option in options" 
              :key="option.value"
              class="status-item"
              @click="selectStatus(option.value)"
            >
              <span class="status-dot" :class="getClassForStatus(option.value)"></span>
              {{ option.label }}
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
  
  const props = defineProps({
    modelValue: { type: String, required: true },
    projectId: { type: [String, Number], required: true } // ID może być stringiem (UUID)
  });
  
  const emit = defineEmits(['update:modelValue', 'statusChanged']);
  
  const isOpen = ref(false);
  const isLoading = ref(false);
  const triggerRef = ref(null);
  const menuPosition = ref({}); // Styl pozycji
  
  const options = [
    { value: 'NOWY', label: 'Nowy' },
    { value: 'W_REALIZACJI', label: 'W realizacji' },
    { value: 'ZAKONCZONY', label: 'Zakończony' },
    { value: 'ANULOWANY', label: 'Anulowany' }
  ];
  
  const currentLabel = computed(() => {
    const opt = options.find(o => o.value === props.modelValue);
    return opt ? opt.label : props.modelValue;
  });
  
  const getClassForStatus = (status) => {
    switch(status) {
      case 'NOWY': return 'status-new';
      case 'W_REALIZACJI': return 'status-progress';
      case 'ZAKONCZONY': return 'status-done';
      case 'ANULOWANY': return 'status-cancelled';
      default: return 'status-default';
    }
  };
  
  const statusClass = computed(() => getClassForStatus(props.modelValue));
  
  // --- POZYCJONOWANIE ---
  const updatePosition = () => {
    if (triggerRef.value) {
      const rect = triggerRef.value.getBoundingClientRect();
      menuPosition.value = {
        top: `${rect.bottom + window.scrollY + 4}px`, // 4px odstępu
        left: `${rect.left + window.scrollX}px`,
        minWidth: `${rect.width}px`
      };
    }
  };
  
  const toggleDropdown = async () => {
    if (isLoading.value) return;
    
    if (isOpen.value) {
      closeDropdown();
    } else {
      isOpen.value = true;
      await nextTick(); // Czekamy aż Vue wyrenderuje element
      updatePosition(); // Obliczamy pozycję
    }
  };
  
  const closeDropdown = () => {
    isOpen.value = false;
  };
  
  // Aktualizuj pozycję przy scrollowaniu, żeby menu nie "odjechało"
  const handleScroll = () => {
    if (isOpen.value) updatePosition();
  };
  
  onMounted(() => window.addEventListener('scroll', handleScroll, true));
  onUnmounted(() => window.removeEventListener('scroll', handleScroll, true));
  
  const selectStatus = (newStatus) => {
    if (newStatus === props.modelValue) {
      closeDropdown();
      return;
    }
    isLoading.value = true;
    closeDropdown();
    emit('statusChanged', { id: props.projectId, status: newStatus, done: () => isLoading.value = false });
  };
  
  // Dyrektywa Click Outside
  const vClickOutside = {
    mounted(el, binding) {
      el.clickOutsideEvent = (event) => {
        // Sprawdzamy czy kliknięto poza menu ORAZ poza triggerem
        const trigger = binding.instance?.$refs?.triggerRef;
        if (!(el === event.target || el.contains(event.target) || (trigger && trigger.contains(event.target)))) {
          binding.value();
        }
      };
      document.addEventListener('click', el.clickOutsideEvent);
    },
    unmounted(el) {
      document.removeEventListener('click', el.clickOutsideEvent);
    }
  };
  </script>
  
  <style scoped>
  .status-badge-wrapper {
    display: inline-block;
  }
  
  .status-trigger {
    padding: 6px 12px;
    border-radius: 30px;
    font-size: 0.75rem; /* Mniejszy font, żeby był zgrabny */
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    transition: all 0.2s;
    user-select: none;
    border: 1px solid transparent;
    white-space: nowrap;
  }
  
  .status-trigger:hover {
    filter: brightness(0.95);
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  }
  
  .rotate-180 { transform: rotate(180deg); transition: transform 0.2s; }
  
  /* Menu Fixed - pozycja obliczana w JS */
  .status-menu-fixed {
    position: absolute; /* Używamy absolute względem body (dzięki teleportowi zachowuje się jak fixed ale scrolluje ze stroną) */
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    border: 1px solid rgba(0,0,0,0.05);
    z-index: 99999; /* Zawsze na wierzchu */
    min-width: 140px;
    padding: 4px;
    overflow: hidden;
  }
  
  .status-item {
    padding: 8px 12px;
    font-size: 0.8rem;
    color: #374151;
    cursor: pointer;
    display: flex;
    align-items: center;
    border-radius: 8px;
    transition: background 0.1s;
  }
  
  .status-item:hover {
    background: #f3f4f6;
  }
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
    flex-shrink: 0;
  }
  
  /* Klasy kolorów (takie same jak w Dashboard) */
  .status-new { background: #e0f2fe; color: #0284c7; border-color: #bae6fd; }
  .status-progress { background: #fef3c7; color: #d97706; border-color: #fde68a; }
  .status-done { background: #dcfce7; color: #16a34a; border-color: #bbf7d0; }
  .status-cancelled { background: #f3f4f6; color: #6b7280; border-color: #e5e7eb; }
  .status-default { background: #f3f4f6; color: #6b7280; }
  
  /* Animacja Fade */
  .fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
  .fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-5px); }
  </style>