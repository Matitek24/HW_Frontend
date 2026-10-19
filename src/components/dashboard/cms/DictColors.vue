<template>
    <div>
      <!-- Pasek narzędzi: import/szablon + masowe usuwanie -->
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div class="d-flex flex-wrap gap-2">
          <button class="glass-btn" @click="downloadJsonTemplate" :disabled="isLoading">
            Pobierz szablon JSON
          </button>
          <button class="glass-btn" @click="fileInput.click()" :disabled="isLoading">
            Wgraj JSON
          </button>
          <input
            ref="fileInput"
            type="file"
            accept=".json,application/json"
            class="d-none"
            @change="importFromJson"
          />
        </div>
  
        <Transition name="fade">
          <button
            v-if="selectedIds.length > 0"
            class="glass-btn glass-btn-danger"
            @click="bulkDelete"
            :disabled="isLoading"
          >
            Usuń zaznaczone ({{ selectedIds.length }})
          </button>
        </Transition>
      </div>
  
      <!-- Formularz dodawania pojedynczego koloru -->
      <div class="row mb-5 align-items-end bg-light p-4 rounded-4 shadow-sm border border-white">
        <div class="col-md-4">
          <label class="form-label text-muted small fw-bold">NAZWA KOLORU</label>
          <input
            type="text"
            v-model="newColor.nazwa"
            class="form-control"
            placeholder="np. Granatowy Ocean"
            @keyup.enter="addColor"
          />
        </div>
        <div class="col-md-4">
          <label class="form-label text-muted small fw-bold">WARTOŚĆ HEX</label>
          <div class="d-flex align-items-center gap-2">
            <!-- Natywny próbnik kolorów -->
            <input
              type="color"
              v-model="newColor.hex"
              class="form-control form-control-color border-0 p-1 rounded-circle"
              style="width: 40px; height: 40px; cursor: pointer;"
            />
            <input type="text" v-model="newColor.hex" class="form-control text-uppercase" style="width: 120px;" />
          </div>
        </div>
        <div class="col-md-4 d-flex justify-content-end">
          <button @click="addColor" class="tab-btn active" :disabled="isLoading">
            + Dodaj kolor
          </button>
        </div>
      </div>
  
      <!-- Loader -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
  
      <!-- Tabela z kolorami -->
      <div v-else class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr class="text-muted small">
              <th style="width: 40px;">
                <input
                  ref="masterCheckbox"
                  type="checkbox"
                  class="form-check-input"
                  :checked="isAllSelected"
                  :disabled="colors.length === 0"
                  @change="toggleAll"
                />
              </th>
              <th>ID</th>
              <th>PODGLĄD</th>
              <th>NAZWA</th>
              <th>KOD HEX</th>
              <th>STATUS</th>
              <th class="text-end">AKCJE</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="kolor in paginatedColors"
              :key="kolor.id"
              :class="{ 'row-selected': selectedIds.includes(kolor.id) }"
            >
              <td>
                <input type="checkbox" class="form-check-input" :value="kolor.id" v-model="selectedIds" />
              </td>
              <td class="text-muted">#{{ kolor.id }}</td>
              <td>
                <div
                  class="rounded-circle shadow-sm border border-light"
                  :style="{ backgroundColor: kolor.hex, width: '32px', height: '32px' }"
                ></div>
              </td>
              <td class="fw-medium">{{ kolor.nazwa }}</td>
              <td class="text-uppercase text-muted">{{ kolor.hex }}</td>
              <td>
                <span
                  class="badge"
                  :class="kolor.isActive ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'"
                >
                  {{ kolor.isActive ? 'Widoczny' : 'Ukryty' }}
                </span>
              </td>
              <td class="text-end">
                <button @click="toggleStatus(kolor)" class="glass-btn glass-btn-sm me-2">
                  {{ kolor.isActive ? 'Ukryj' : 'Pokaż' }}
                </button>
                <button @click="deleteColor(kolor.id)" class="glass-btn glass-btn-sm glass-btn-danger">Usuń</button>
              </td>
            </tr>
            <tr v-if="colors.length === 0">
              <td colspan="7" class="text-center text-muted py-4">Brak kolorów w bazie.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-3">
    <button class="glass-btn glass-btn-sm" :disabled="currentPage === 1" @click="currentPage--">
      Poprzednia
    </button>
    <span class="text-muted small">Strona {{ currentPage }} z {{ totalPages }}</span>
    <button class="glass-btn glass-btn-sm" :disabled="currentPage === totalPages" @click="currentPage++">
      Następna
    </button>
  </div>
    </div>
  </template>
  <script setup>
  import { ref, computed, watchEffect, onMounted, watch } from 'vue';
  import { adminDictionaryAPI } from '../../../utils/axios';
  
  const colors = ref([]);
  const isLoading = ref(false);
  const selectedIds = ref([]);
  const fileInput = ref(null);
  const masterCheckbox = ref(null);
  
  const newColor = ref({
    nazwa: '',
    hex: '#000000',
    isActive: true
  });
  
  const HEX_REGEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
  
  // --- PAGINACJA ---
  const currentPage = ref(1);
  const itemsPerPage = 10;
  
  const totalPages = computed(() => Math.ceil(colors.value.length / itemsPerPage));
  
  const paginatedColors = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return colors.value.slice(start, start + itemsPerPage);
  });
  
  watch(totalPages, (newTotal) => {
    if (currentPage.value > newTotal && newTotal > 0) {
      currentPage.value = newTotal;
    }
  });
  
  // --- MASOWE USUWANIE (TYLKO JEDNA DEKLARACJA) ---
  const isAllSelected = computed(
    () => paginatedColors.value.length > 0 && paginatedColors.value.every(k => selectedIds.value.includes(k.id))
  );
  
  const isSomeSelected = computed(
    () => paginatedColors.value.some(k => selectedIds.value.includes(k.id)) && !isAllSelected.value
  );
  
  watchEffect(() => {
    if (masterCheckbox.value) masterCheckbox.value.indeterminate = isSomeSelected.value;
  });
  
  const toggleAll = (e) => {
    const pageIds = paginatedColors.value.map(k => k.id);
    if (e.target.checked) {
      selectedIds.value = [...new Set([...selectedIds.value, ...pageIds])];
    } else {
      selectedIds.value = selectedIds.value.filter(id => !pageIds.includes(id));
    }
  };
  
  // --- API CRUD ---
  const fetchColors = async () => {
    isLoading.value = true;
    try {
      const response = await adminDictionaryAPI.getColors();
      colors.value = response.data;
      const existing = new Set(colors.value.map(k => k.id));
      selectedIds.value = selectedIds.value.filter(id => existing.has(id));
    } catch (error) {
      console.error('Błąd pobierania kolorów:', error);
    } finally {
      isLoading.value = false;
    }
  };
  
  const addColor = async () => {
    if (!newColor.value.nazwa.trim()) return alert('Podaj nazwę koloru!');
    if (!HEX_REGEX.test(newColor.value.hex)) return alert('Niepoprawny kod HEX (np. #1A2B3C).');
  
    isLoading.value = true;
    try {
      await adminDictionaryAPI.addColor({ ...newColor.value, nazwa: newColor.value.nazwa.trim() });
      newColor.value.nazwa = '';
      newColor.value.hex = '#000000';
      await fetchColors();
    } catch (error) {
      alert('Błąd podczas dodawania.');
    } finally {
      isLoading.value = false;
    }
  };
  
  const toggleStatus = async (kolor) => {
    try {
      await adminDictionaryAPI.updateColorStatus(kolor.id, !kolor.isActive);
      kolor.isActive = !kolor.isActive;
    } catch (error) {
      alert('Nie udało się zmienić statusu.');
    }
  };
  
  const deleteColor = async (id) => {
    if (!confirm('Na pewno usunąć ten kolor? Upewnij się, że nie jest przypisany do żadnego projektu.')) return;
    try {
      await adminDictionaryAPI.deleteColor(id);
      selectedIds.value = selectedIds.value.filter(x => x !== id);
      await fetchColors();
    } catch (error) {
      alert('Nie można usunąć koloru (być może jest już używany w projektach). Spróbuj go po prostu Ukryć.');
    }
  };
  
  const bulkDelete = async () => {
    if (!confirm(`Na pewno usunąć ${selectedIds.value.length} kolorów? Upewnij się, że nie są używane w projektach.`)) return;
    isLoading.value = true;
    try {
      await adminDictionaryAPI.deleteColorsBulk(selectedIds.value);
      selectedIds.value = [];
    } catch (error) {
      alert('Nie udało się usunąć niektórych kolorów. Mogą być w użyciu — spróbuj je Ukryć.');
    } finally {
      await fetchColors();
    }
  };
  
  // --- IMPORT / SZABLON JSON ---
  const downloadJsonTemplate = () => {
    const template = [
      { nazwa: 'Czarny Głęboki', hex: '#000000' },
      { nazwa: 'Czysta Biel', hex: '#FFFFFF' }
    ];
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'szablon_kolorow.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  
  const importFromJson = (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!Array.isArray(parsed)) throw new Error('Plik musi zawierać tablicę JSON.');
  
        const valid = parsed
          .filter(c => c && typeof c.nazwa === 'string' && c.nazwa.trim() && HEX_REGEX.test(c.hex))
          .map(c => ({ nazwa: c.nazwa.trim(), hex: c.hex.toUpperCase(), isActive: c.isActive ?? true }));
  
        const skipped = parsed.length - valid.length;
        if (valid.length === 0) throw new Error('Brak poprawnych pozycji w pliku.');
  
        isLoading.value = true;
        await adminDictionaryAPI.addColorsBulk(valid);
        await fetchColors();
        alert(
          `Zaimportowano ${valid.length} kolorów.` +
            (skipped > 0 ? ` Pominięto ${skipped} niepoprawnych pozycji.` : '')
        );
      } catch (err) {
        console.error(err);
        alert('Błąd przetwarzania pliku JSON. Upewnij się, że struktura jest zgodna z szablonem.');
      } finally {
        isLoading.value = false;
        event.target.value = null; 
      }
    };
  
    reader.readAsText(file);
  };
  
  onMounted(fetchColors);
  </script>
  
  <style scoped>
  /* Przyciski spójne z .glass-tabs / .tab-btn z CmsDashboard */
  .glass-btn {
    background: rgba(242, 242, 242, 0.459);
    border: 1px solid rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(10px);
    padding: 8px 20px;
    border-radius: 99px;
    font-weight: 500;
    font-size: 0.9rem;
    color: #4b5563;
    transition: all 0.3s ease;
  }
  .glass-btn:hover:not(:disabled) {
    background: #1f2937;
    color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  .glass-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .glass-btn-sm {
    padding: 4px 14px;
    font-size: 0.8rem;
  }
  .glass-btn-danger {
    color: #dc2626;
    border-color: rgba(220, 38, 38, 0.25);
  }
  .glass-btn-danger:hover:not(:disabled) {
    background: #dc2626;
    color: #fff;
  }
  
  /* przycisk główny (taki sam jak aktywna zakładka) */
  .tab-btn {
    border: none;
    padding: 8px 24px;
    border-radius: 99px;
    font-weight: 500;
    transition: all 0.3s ease;
  }
  .tab-btn.active {
    background: #1f2937;
    color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  .tab-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  /* podświetlenie zaznaczonych wierszy */
  .row-selected > td {
    background-color: rgba(31, 41, 55, 0.06) !important;
  }
  
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  </style>