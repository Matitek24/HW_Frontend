<template>
  <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4">
    <div class="text-muted small mb-3 mb-md-0">
      Wyświetlono {{ showingStart }}-{{ showingEnd }} z {{ totalProjects }} zamówień
    </div>
    
    <nav v-if="totalPages > 1">
      <ul class="pagination mb-0">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="changePage(currentPage - 1)">
            &laquo;
          </button>
        </li>
        
        <li v-for="page in pages" :key="page" class="page-item" :class="{ active: page === currentPage }">
          <button class="page-link" @click="changePage(page)">
            {{ page }}
          </button>
        </li>
        
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link" @click="changePage(currentPage + 1)">
            &raquo;
          </button>
        </li>
      </ul>
    </nav>

    <div class="d-flex align-items-center gap-2 mt-3 mt-md-0">
      <span class="text-muted small">Pozycji na stronie:</span>
      <select v-model="localItemsPerPage" @change="emitItemsPerPage" class="form-select form-select-sm" style="width: 80px;">
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  totalProjects: { type: Number, required: true },
  itemsPerPage: { type: Number, required: true }
});

const emit = defineEmits(['update:currentPage', 'update:itemsPerPage']);

const localItemsPerPage = ref(props.itemsPerPage);

watch(() => props.itemsPerPage, (newVal) => {
  localItemsPerPage.value = newVal;
});

const emitItemsPerPage = () => {
  emit('update:itemsPerPage', Number(localItemsPerPage.value));
};

const changePage = (page) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('update:currentPage', page);
  }
};

const pages = computed(() => {
  const pageList = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, props.currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(props.totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageList.push(i);
  }
  
  return pageList;
});

const showingStart = computed(() => {
  if (props.totalProjects === 0) return 0;
  return (props.currentPage - 1) * props.itemsPerPage + 1;
});

const showingEnd = computed(() => {
  return Math.min(props.currentPage * props.itemsPerPage, props.totalProjects);
});
</script>

<style scoped>
.page-link {
  border: 1px solid rgba(0,0,0,0.1);
  color: #6b7280;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.2s ease;
}

.page-item.active .page-link {
  background-color: #1f2937;
  border-color: #1f2937;
  color: white;
}

.page-item:not(.active) .page-link:hover {
  background-color: #f3f4f6;
}

.page-item.disabled .page-link {
  background-color: rgba(255, 255, 255, 0.3);
  color: #9ca3af;
  cursor: not-allowed;
}
</style>
