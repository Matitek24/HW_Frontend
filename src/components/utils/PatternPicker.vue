<template>
    <div class="pattern-picker-wrapper">
      <div class="pattern-trigger"   :style="{ width: props.opt ? '150px' : '' }"  @click="openModal">
        <span class="pattern-name">{{ selectedPattern ? selectedPattern.nazwa : 'Brak wzoru' }}</span>
        <i class="bi bi-chevron-down ms-auto"></i>
      </div>
  
      <Teleport to="body">
        <div v-if="isOpen" class="modal-backdrop show"></div>
        <div v-if="isOpen" class="modal show d-block" tabindex="-1" @click.self="closeModal">
          <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content glass-modal">
              
              <div class="modal-header border-0">
                <h5 class="modal-title fw-bold text-secondary">{{ title }}</h5>
                <button type="button" class="btn-close" @click="closeModal"></button>
              </div>
              
              <div class="modal-body">
                <div class="row g-3">
                  
                  <div class="col-6 col-md-4 col-lg-3">
                    <div 
                      class="pattern-card" 
                      :class="{ active: !modelValue }"
                      @click="selectPattern(null)"
                    >
                      <div class="pattern-preview-box empty-box">
                        <span class="text-muted small">Brak</span>
                      </div>
                      <div class="pattern-label">Bez wzoru</div>
                    </div>
                  </div>
  
                  <div 
                    v-for="pattern in options" 
                    :key="pattern.id" 
                    class="col-6 col-md-4 col-lg-3"
                  >
                    <div 
                      class="pattern-card" 
                      :class="{ active: modelValue === pattern.id }"
                      @click="selectPattern(pattern.id)"
                    >
                      <div class="pattern-preview-box">
                        <svg viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid meet">
                           <g v-html="pattern.kodSvg"></g>
                        </svg>
                      </div>
                      <div class="pattern-label">{{ pattern.nazwa }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  
  const props = defineProps({
    modelValue: { type: [Number, String, null], default: null },
    options: { type: Array, default: () => [] }, 
    title: { type: String, default: 'Wybierz wzór' },
    opt: {type:Boolean, default:false},
  });

  const triggerRef = ref(null);

onMounted(() => {
  if (props.opt && triggerRef.value) {
    triggerRef.value.style.width = '200px';
  }
});

  const emit = defineEmits(['update:modelValue']);
  
  const isOpen = ref(false);
  
  const openModal = () => isOpen.value = true;
  const closeModal = () => isOpen.value = false;
  
  const selectedPattern = computed(() => {
    return props.options.find(p => p.id === props.modelValue);
  });
  
  const selectPattern = (id) => {
    emit('update:modelValue', id);
    closeModal();
  };
  </script>
  
  <style scoped>
  .pattern-picker-wrapper {
    width: 100%;
  }
  
  /* Trigger (to co widać w pasku) */
  .pattern-trigger {
    background: #f3f4f6;
    border-radius: 12px;
    width: 80px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s;
    height: 42px;
  }
  .pattern-trigger:hover {
    background: #fff;
    border-color: #e5e7eb;
  }
  
  .pattern-preview-mini {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
    border: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .mini-svg { width: 100%; height: 100%; }
  
  .pattern-name {
    font-size: 13px;
    font-weight: 500;
    color: #374151;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  /* Modal Styles */
  .glass-modal {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    border: none;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  }
  
  .pattern-card {
    border: 2px solid transparent;
    border-radius: 12px;
    padding: 8px;
    cursor: pointer;
    transition: all 0.2s;
    background: #f9fafb;
  }
  .pattern-card:hover {
    background: #fff;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    transform: translateY(-2px);
  }
  .pattern-card.active {
    border-color: #3b82f6;
    background: #eff6ff;
  }
  
  .pattern-preview-box {
    width: 100%;
    height: 60px;
    padding:5px;
    padding-left:10px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    margin-bottom: 8px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .pattern-preview-box svg {
    width: 100%;
    height: 100%;
  }
  
  .empty-box {
    background: #f3f4f6;
    border: 1px dashed #cbd5e1;
  }
  
  .pattern-label {
    font-size: 12px;
    text-align: center;
    font-weight: 600;
    color: #4b5563;
  }
  
  /* Modal Backdrop Fix */
  .modal-backdrop {
    background-color: rgba(0,0,0,0.3);
  }
  </style>