<template>
    <div class="search-filter-wrapper">
      <div class="search-container">
        <!-- Wybór typu wyszukiwania -->
        <div class="filter-type-selector">
          <button 
            v-for="type in filterTypes" 
            :key="type.value"
            @click="selectedType = type.value"
            class="filter-type-btn"
            :class="{ active: selectedType === type.value }"
          >
            <component :is="type.icon" />
            <span>{{ type.label }}</span>
          </button>
        </div>
  
        <!-- Input wyszukiwania -->
        <div class="search-input-wrapper">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          
          <input 
            v-model="searchQuery"
            type="text"
            class="search-input"
            :placeholder="currentPlaceholder"
            @input="handleSearch"
          />
  
          <button 
            v-if="searchQuery" 
            @click="clearSearch"
            class="clear-btn"
          >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round"
            >
  <line x1="18" y1="6" x2="6" y2="18"></line>
  <line x1="6" y1="6" x2="18" y2="18"></line>
</svg>
          </button>
        </div>
  
        <!-- Licznik wyników -->
        <div v-if="searchQuery" class="results-count">
          Znaleziono: <strong>{{ resultsCount }}</strong>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue';
  
  // Ikony jako komponenty inline
  const UserIcon = {
    template: `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    `
  };
  
  const MailIcon = {
    template: `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="4" width="20" height="16" rx="2"></rect>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
      </svg>
    `
  };
  
  const CalendarIcon = {
    template: `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    `
  };
  
  const IdIcon = {
    template: `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="8.5" cy="7" r="4"></circle>
        <polyline points="17 11 19 13 23 9"></polyline>
      </svg>
    `
  };
  
  const props = defineProps({
    resultsCount: {
      type: Number,
      default: 0
    }
  });
  
  const emit = defineEmits(['search']);
  
  const filterTypes = [
    { value: 'name', label: 'Imię', icon: UserIcon },
    { value: 'email', label: 'Email', icon: MailIcon },
    { value: 'date', label: 'Data', icon: CalendarIcon },
    { value: 'id', label: 'ID', icon: IdIcon }
  ];
  
  const selectedType = ref('name');
  const searchQuery = ref('');
  
  const currentPlaceholder = computed(() => {
    const placeholders = {
      name: 'Wpisz imię i nazwisko...',
      email: 'Wpisz adres email...',
      date: 'Wpisz datę (DD.MM.RRRR)...',
      id: 'Wpisz numer ID...'
    };
    return placeholders[selectedType.value];
  });
  
  const handleSearch = () => {
    emit('search', {
      type: selectedType.value,
      query: searchQuery.value
    });
  };
  
  const clearSearch = () => {
    searchQuery.value = '';
    handleSearch();
  };
  
  // Reaguj na zmianę typu filtrowania
  watch(selectedType, () => {
    if (searchQuery.value) {
      handleSearch();
    }
  });
  </script>
  
  <style scoped>
  .search-filter-wrapper {
    margin-bottom: 24px;
  }
  
  .search-container {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  }
  
  /* Przyciski wyboru typu */
  .filter-type-selector {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }
  
  .filter-type-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: white;
    border-radius: 10px;
    color: #6b7280;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .filter-type-btn:hover {
    background: #f9fafb;
    border-color: #d1d5db;
    color: #374151;
  }
  
  .filter-type-btn.active {
    background: #1f2937;
    color: white;
    border-color: #1f2937;
  }
  
  .filter-type-btn svg {
    flex-shrink: 0;
  }
  
  /* Input wyszukiwania */
  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .search-icon {
    position: absolute;
    left: 16px;
    color: #9ca3af;
    pointer-events: none;
  }
  
  .search-input {
    width: 100%;
    padding: 12px 48px 12px 48px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    font-size: 0.95rem;
    background: white;
    transition: all 0.2s ease;
    color:rgb(32, 32, 32);
  }
  
  .search-input:focus {
    outline: none;
    border-color: #1f2937;
    box-shadow: 0 0 0 3px rgba(31, 41, 55, 0.1);
  }
  
  .search-input::placeholder {
    color: #9ca3af;
  }
  
  .clear-btn {
    position: absolute;
    right: 12px;
    color: #000000;
    background: #f3f4f6;
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 32px;

    transition: all 0.2s ease;
  }
  .clear-btn svg{
    display: block;
    margin: auto;
    position: relative;
    bottom:2px;
    right: 8px;
  }
  
  .clear-btn:hover {
    background: #e5e7eb;
    color: #374151;
  }
  
  /* Licznik wyników */
  .results-count {
    margin-top: 12px;
    font-size: 0.9rem;
    color: #6b7280;
    text-align: center;
  }
  
  .results-count strong {
    color: #1f2937;
    font-weight: 600;
  }
  
  /* Responsywność */
  @media (max-width: 640px) {
    .filter-type-selector {
      gap: 6px;
    }
    
    .filter-type-btn {
      padding: 6px 12px;
      font-size: 0.85rem;
    }
    .glass-panel {
    padding: 20px 15px; /* Mniejszy padding panelu */
  }
  
  /* Header (Wszystkie / Nowe / CSV) */
  .glass-panel .d-flex.justify-content-between {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .glass-panel .d-flex.gap-3 {
    justify-content: space-between;
    width: 100%;
  }
  
  /* Przycisk CSV na całą szerokość */
  .action-btn-primary {
    width: 100%;
    justify-content: center;
  }
    
  }
 
  </style>