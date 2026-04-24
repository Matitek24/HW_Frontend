<template>
  <div class="glass-panel-filters p-4 mb-4">
    <div class="row g-3 align-items-end">
      
      <!-- Typ Wyszukiwania -->
      <div class="col-md-3">
        <label class="form-label text-muted small fw-bold text-uppercase mb-2">Szukaj po:</label>
        <select v-model="searchType" class="form-select custom-select">
          <option value="name">Osobie / Firmie</option>
          <option value="email">Adresie Email</option>
          <option value="date">Dacie (RRRR-MM-DD)</option>
          <option value="id">ID Zamówienia</option>
        </select>
      </div>

      <!-- Pole wyszukiwania -->
      <div class="col-md-6">
        <label class="form-label text-muted small fw-bold text-uppercase mb-2">Fraza wyszukiwania:</label>
        <div class="position-relative">
          <input 
            type="text" 
            v-model="searchQuery"
            class="form-control custom-input pe-5"
            :placeholder="placeholderText"
            @keyup.enter="applyFilters"
          >
          <button 
            v-if="searchQuery" 
            @click="clearSearch"
            class="btn position-absolute end-0 top-50 translate-middle-y px-3 text-muted border-0 bg-transparent"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Akcja -->
      <div class="col-md-3">
        <button 
          @click="applyFilters"
          class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
          style="height: 42px;"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          Wyszukaj
        </button>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(['search']);

const searchType = ref('name');
const searchQuery = ref('');

const placeholderText = computed(() => {
  switch(searchType.value) {
    case 'name': return 'np. Jan Kowalski';
    case 'email': return 'np. jan@example.com';
    case 'date': return 'np. 2024-03';
    case 'id': return 'Wpisz ID projektu...';
    default: return 'Szukaj...';
  }
});

const applyFilters = () => {
  emit('search', {
    type: searchType.value,
    query: searchQuery.value.trim()
  });
};

const clearSearch = () => {
  searchQuery.value = '';
  applyFilters();
};
</script>

<style scoped>
.glass-panel-filters {
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 16px;
}

.custom-select, .custom-input {
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.08);
  height: 42px;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.custom-select:focus, .custom-input:focus {
  background-color: #fff;
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.1);
}

.custom-select {
  cursor: pointer;
}
</style>
