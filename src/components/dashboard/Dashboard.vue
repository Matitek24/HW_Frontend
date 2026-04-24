<template>
  <div class="dashboard-wrapper" style="overflow: hidden;">
    <div class="bg-blob blob-1"></div>
    <div class="bg-blob blob-2"></div>

    <div class="container-fluid px-xxl-5 position-relative z-1">
      
      <header class="d-flex justify-content-between align-items-center py-5 mb-3">
        <div>
          <h1 class="display-6 fw-bold text-dark mb-0" style="letter-spacing: -1px;">Zamówienia</h1>
          <p class="text-muted fw-light">Panel Headwear</p>
        </div>
        <button @click="handleLogout" class="glass-btn-logout">
          Wyloguj
        </button>
      </header>

      <div class="glass-panel p-4 p-lg-5">
        
        <div class="d-flex justify-content-between align-items-center mb-5">
          <div class="d-flex gap-3 align-items-center">
            <span class="badge glass-badge text-dark px-3 py-2 rounded-pill">Wszystkie: {{ totalProjects }}</span>
            <span class="badge glass-badge text-success px-3 py-2 rounded-pill">Nowe: {{ newProjectsCount }}</span>
          </div>
          <div>
            <button class="action-btn-primary shadow-sm" @click="exportCSV">
              Eksportuj CSV
            </button>
          </div>
        </div>

        <!-- Wyszukiwarka -->
        <SearchFilter 
          :results-count="totalProjects" 
          @search="handleSearch" 
        />

        <div v-if="isLoading" class="loading-overlay-table">
          <div class="spinner text-primary" role="status"></div>
        </div>

        <!-- Tabela z zamówieniami -->
        <OrdersTable 
          :projects="projects"
          :patterns-dict="patternsDict"
          :is-loading="isLoading"
          :current-sort="currentSort"
          :current-sort-dir="currentSortDir"
          :get-pattern-name="getPatternName"
          @sort="handleSort"
          @statusChanged="toggleStatus"
          @downloadPdf="downloadProductionPdf"
        />

        <!-- Paginacja -->
        <DashboardPagination 
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-projects="totalProjects"
          :items-per-page="itemsPerPage"
          @update:currentPage="changePage"
          @update:itemsPerPage="setParams"
        />

      </div>
    </div>

    <!-- Niewidoczny kontener do generowania PDF -->
    <Teleport to="body">
      <div 
        id="pdf-ghost-container" 
        class="pdf-ghost"
      >
        <div v-if="pdfProjectData" class="pdf-ghost-inner">
          <HatFlat 
            :config="pdfProjectData.config" 
            :patternsDict="patternsDict"
            style="width: 100%; height: 100%;"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { removeStoredToken, getStoredToken, isTokenValid } from '../../utils/jwt';
import { useProductionCard } from '../../utils/useProductionCard';

// Nowe Komponenty
import SearchFilter from '../SearchFilter.vue';
import OrdersTable from './OrdersTable.vue';
import DashboardPagination from './DashboardPagination.vue';
import HatFlat from '../hat/HatFlat.vue';

// Logika (Composable)
import { useAdminOrders } from './composables/useAdminOrders';

const router = useRouter();

// Wyciągamy niezbędne rzeczy z composable
const {
  projects,
  isLoading,
  currentPage,
  itemsPerPage,
  totalPages,
  totalProjects,
  newProjectsCount,
  currentSort,
  currentSortDir,
  patternsDict,
  fetchData,
  handleSort,
  handleSearch,
  changePage,
  setParams,
  getPatternName,
  exportCSV,
  toggleStatus
} = useAdminOrders();

// PDF Generator logic
const { generateProductionCard } = useProductionCard();
const pdfProjectData = ref(null);

const downloadProductionPdf = async (project) => {
    isLoading.value = true; 
    try {
        pdfProjectData.value = project;
        await nextTick();
        await new Promise(r => setTimeout(r, 100)); 
        const ghostElement = document.getElementById('pdf-ghost-container');
        await generateProductionCard(project, ghostElement, patternsDict.value);
    } catch (e) {
        console.error("Błąd PDF:", e);
        alert("Nie udało się wygenerować PDF.");
    } finally {
        isLoading.value = false;
        pdfProjectData.value = null;
    }
};

const handleLogout = () => {
  removeStoredToken();
  router.push('/login');
};

onMounted(async () => {
  const token = getStoredToken();
  if (!token || !isTokenValid(token)) {
    alert("Sesja wygasła. Zaloguj się ponownie.");
    router.push('/login');
    return;
  }
  await fetchData();
});
</script>

<style scoped>
.dashboard-wrapper {
  min-height: 100vh;
  background-color: #ffffff;
  position: relative;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding-bottom: 40px; 
}

.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
  opacity: 0.6;
  will-change: transform; 
  pointer-events: none; 
}

.blob-1 { width: 400px; height: 400px; background: #9fdae454; top: -100px; left: -100px; }
.blob-2 { width: 500px; height: 500px; background: #60a5fa45; bottom: -150px; right: -100px; }

.glass-panel {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px); 
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.05);
  position: relative;
}

.glass-badge {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.05);
  font-weight: 500;
  letter-spacing: 0.5px;
}

.glass-btn-logout {
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 12px;
  color: #4b5563;
  font-weight: 500;
  transition: all 0.3s ease;
}
.glass-btn-logout:hover {
  background: white;
  color: #dc2626;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.action-btn-primary {
  background: #1f2937;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 12px;
  font-weight: 500;
  transition: transform 0.2s;
}
.action-btn-primary:hover {
  transform: translateY(-2px);
  background: #111827;
}

.pdf-ghost {
  position: fixed; 
  left: -9999px; 
  top: 0; 
  width: 1200px; 
  height: 800px; 
  z-index: -9999;
  visibility: hidden; 
  display: flex; 
  align-items: center;
  justify-content: center;
}

.pdf-ghost-inner {
  width: 100%; 
  height: 100%; 
  visibility: visible; 
  background: transparent;
}

.loading-overlay-table {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
  border-radius: 24px;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 0.25em solid #1f2937;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border .75s linear infinite;
}

@keyframes spinner-border {
  to { transform: rotate(360deg); }
}
</style>
