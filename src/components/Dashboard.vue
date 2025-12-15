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
        <SearchFilter 
          :results-count="totalProjects" 
          @search="handleSearch" 
        />
        <div v-if="isLoading" class="loading-overlay-table">
          <div class="spinner text-primary" role="status">
          </div>
        </div>
        <div class="table-responsive" :class="{ 'blur-content': isLoading }">
          <table 
            class="table align-middle custom-table" 
            :class="{ 'table-hover': !isMobile }"
          >
            <thead>
              <tr>
                <th class="ps-4 clickable-header" @click="sort('date')">
                  <div class="d-flex align-items-center gap-1">
                    ID / Data
                    <span class="sort-icon" :class="{ active: currentSort === 'date' }">
                      <svg v-if="currentSort === 'date' && currentSortDir === 'asc'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
                      <svg v-else-if="currentSort === 'date' && currentSortDir === 'desc'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="2"><polyline points="7 13 12 18 17 13"></polyline><polyline points="7 11 12 6 17 11"></polyline></svg>
                    </span>
                  </div>
                </th>
                <th>Wizualizacja</th>
                <th>Klient</th>
                <th>Kontakt</th>
                <th>Ilość</th>
                <th class="clickable-header" @click="sort('status')">
                  <div class="d-flex align-items-center gap-1">
                    Status
                    <span class="sort-icon" :class="{ active: currentSort === 'status' }">
                      <svg v-if="currentSort === 'status' && currentSortDir === 'asc'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
                      <svg v-else-if="currentSort === 'status' && currentSortDir === 'desc'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="2"><polyline points="7 13 12 18 17 13"></polyline><polyline points="7 11 12 6 17 11"></polyline></svg>
                    </span>
                  </div>
                </th>
                <th class="text-end pe-4">Akcje</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="project in paginatedProjects" :key="project.id">
                <tr 
                  class="main-row" 
                  :class="{ 'expanded': expandedRows.includes(project.id) }"
                  @click="toggleRow(project.id)"
                >
                <td class="ps-4">
                  <router-link
                    :to="`/projekt/${project.id}`"
                    class="fw-bold text-dark text-decoration-none underline-hover"
                  >
                    <span class="d-none d-md-inline">#{{ project.id }}</span>
                    
                    <span class="d-inline d-md-none">#{{ project.id.slice(0, 8) }}...</span>
                  </router-link>

                  <br>
                  <small class="text-muted fw-light">{{ project.createdAt }}</small>
                </td>

                  <td>
                    <div   
                    :id="`hat-thumb-${project.id}`" 
                    class="img-wrapper" style="width: 60px; height: 60px; padding: 5px">
                      <HatThumbnail 
                        :config="project.config" 
                        :patternsDict="patternsDict"
                        class="d-flex"/>
                    </div>
                  </td>

                  <td>
                    <div class="d-flex flex-column">
                      <span class="fw-bold text-dark">{{ project.client.name }}</span>
                      <small class="text-muted" v-if="project.client.company">{{ project.client.company }}</small>
                    </div>
                  </td>

                  <td>
                    <div class="d-flex flex-column gap-1">
                      <a class="text-decoration-none text-secondary fs-7">
                        {{ project.client.email }}
                      </a>
                      <a class="text-decoration-none text-secondary fs-7">
                        {{ project.client.phone }}
                      </a>
                    </div>
                  </td>

                  <td>
                    <span class="fw-bold fs-5">{{ project.order.quantity }}</span>
                    <small class="text-muted ms-1">szt.</small>
                  </td>
                  
                  <td>
                    <div @click.stop>
                      <StatusBadge 
                        :model-value="project.status" 
                        :project-id="project.id"
                        @statusChanged="handleStatusChange"
                      />
                    </div>
                  </td>

                  <td class="text-end pe-4">
                    <button 
                class="icon-btn me-2" 
                title="Pobierz Kartę Produkcyjną" 
                @click.stop="downloadProductionPdf(project)" >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </button>
                    <button class="icon-btn transition-transform" :class="{'rotate-180': expandedRows.includes(project.id)}">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                  </td>
                </tr>

                <tr v-if="expandedRows.includes(project.id)" class="detail-row">
                  <td colspan="7" class="p-0 border-0">
                    <div class="detail-container p-4">
                      <div class="row g-4">
                        
                        <div class="col-md-3">
                          <h6 class="detail-header">Baza Czapki</h6>
                          <div class="d-flex flex-column gap-2 mt-3">
                            <div class="color-item">
                              <span class="color-dot" :style="{ background: project.config.base.top }"></span>
                              <span>Góra: <span class="text-muted font-monospace">{{ project.config.base.top }}</span></span>
                            </div>
                            <div class="color-item">
                              <span class="color-dot" :style="{ background: project.config.base.middle }"></span>
                              <span>Środek: <span class="text-muted font-monospace">{{ project.config.base.middle }}</span></span>
                            </div>
                            <div class="color-item">
                              <span class="color-dot" :style="{ background: project.config.base.bottom }"></span>
                              <span>Dół: <span class="text-muted font-monospace">{{ project.config.base.bottom }}</span></span>
                            </div>
                          </div>
                        </div>

                        <div class="col-md-3">
                          <h6 class="detail-header">Dodatki</h6>
                          <div class="mt-3">
                            <p class="mb-1 text-sm"><strong>Pompon:</strong></p>
                            <div class="d-flex gap-1 mb-3">
                              <div class="color-dot-sm" title="P1" :style="{ background: project.config.pompons.p1 }"></div>
                              <div class="color-dot-sm" title="P2" :style="{ background: project.config.pompons.p2 }"></div>
                              <div class="color-dot-sm" title="P3" :style="{ background: project.config.pompons.p3 }"></div>
                              <div class="color-dot-sm" title="P4" :style="{ background: project.config.pompons.p4 }"></div>
                            </div>
                            
                            <p class="mb-1 text-sm"><strong>Wzory:</strong></p>
                            <div class="d-flex flex-column text-muted text-sm">
                              <span>Góra: {{ getPatternName(project.config.patterns.top) }}</span>
                              <span>Dół: {{ getPatternName(project.config.patterns.bottom) }}</span>
                            </div>
                          </div>
                        </div>

                        <div class="col-md-3">
                          <h6 class="detail-header">Personalizacja</h6>
                          <div class="mt-3 p-3 bg-light rounded-3 text-center border border-light">
                            <span 
                              class="d-block mb-2" 
                              :style="{ 
                                color: project.config.text.color, 
                                fontFamily: project.config.text.font,
                                fontSize: '24px',
                                fontWeight: 'bold'
                              }">
                              {{ project.config.text.content }}
                            </span>
                            <small class="text-muted d-block font-monospace">{{ project.config.text.color }}</small>
                          </div>
                        </div>

                         <div class="col-md-3">
                          <h6 class="detail-header">Uwagi Klienta</h6>
                          <div class="mt-3 p-3 bg-white border rounded-3 text-muted fst-italic text-sm h-50">
                             "{{ project.order.notes }}"
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>

          <div v-if="projects.length === 0" class="text-center py-5 text-muted fw-light">
            Brak zamówień do wyświetlenia.
          </div>
        </div>

        <!-- PAGINACJA -->
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4">
          <div class="text-muted small">
            Wyświetlono {{ showingStart }}-{{ showingEnd }} z {{ totalProjects }} zamówień
          </div>
          
          <nav>
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

          <div class="d-flex align-items-center gap-2">
            <span class="text-muted small">Pozycji na stronie:</span>
            <select v-model.number="itemsPerPage" class="form-select form-select-sm" style="width: 80px;">
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
    <div 
      id="pdf-ghost-container" 
      style="
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
      "
    >
      <div 
        v-if="pdfProjectData" 
        style="
          width: 100%; 
          height: 100%; 
          visibility: visible; 
          background: transparent;
        "
      >
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
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { getStoredToken, removeStoredToken, isTokenValid, isAdmin } from '../utils/jwt';
import { adminAPI, dictionaryAPI } from '../utils/axios'; 
import HatThumbnail from './hat/HatThumbnail.vue';
import { exportProjectsToCSV } from '../utils/csvExport.js';
import { useProductionCard } from '../utils/useProductionCard';
import StatusBadge from '../components/admin/StatusBadge.vue';
import SearchFilter from './SearchFilter.vue';
import { nextTick } from 'vue';
import HatFlat from './hat/HatFlat.vue';

const router = useRouter();
const projects = ref([]);
const patternsDict = ref([]);
const expandedRows = ref([]);
const isLoading = ref(false);
const { generateProductionCard } = useProductionCard();
const searchFilter = ref({ type: 'name', query: '' });
const currentSort = ref('date');    
const currentSortDir = ref('desc');
const isMobile = ref(window.innerWidth <= 650);

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
        pdfProjectData.value = null; // Czyścimy ducha
    }
};

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 650;
};

onMounted(() => window.addEventListener('resize', checkMobile));
onUnmounted(() => window.removeEventListener('resize', checkMobile));
// Funkcja zamieniająca ID na nazwę wzoru
const getPatternName = (id) => {
  if (!id) return 'BRAK'; // Jeśli nie ma ID, zwróć 'BRAK'
  
  // Szukamy w załadowanym słowniku patternsDict
  const pattern = patternsDict.value.find(p => p.id == id);
  
  // Jeśli znaleziono, zwróć nazwę (lub nazwa), w przeciwnym razie pokaż samo ID
  return pattern ? (pattern.name || pattern.nazwa) : `ID: ${id}`;
};

const sort = (column) => {
  if (currentSort.value === column) {
    currentSortDir.value = currentSortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort.value = column;
    currentSortDir.value = 'asc';
  }
};

// Funkcja filtrowania
const handleSearch = ({ type, query }) => {
  searchFilter.value = { type, query };
};

const processedProjects = computed(() => {
  let result = [...projects.value];

  // 1. FILTROWANIE (Twoja stara logika)
  if (searchFilter.value.query) {
    const query = searchFilter.value.query.toLowerCase();
    result = result.filter(project => {
      switch(searchFilter.value.type) {
        case 'name': return project.client.name.toLowerCase().includes(query);
        case 'email': return project.client.email.toLowerCase().includes(query);
        case 'date': return project.createdAt.includes(query);
        case 'id': return project.id.toString().toLowerCase().includes(query);
        default: return true;
      }
    });
  }

  // 2. SORTOWANIE (Nowa logika)
  result.sort((a, b) => {
    let modifier = currentSortDir.value === 'desc' ? -1 : 1;

    if (currentSort.value === 'date') {
      return (new Date(a.rawDate) - new Date(b.rawDate)) * modifier;
    } 
    else if (currentSort.value === 'status') {
      return a.status.localeCompare(b.status) * modifier;
    }
    return 0;
  });

  return result;
});


const handleStatusChange = async ({ id, status, done }) => {
  try {
    await adminAPI.updateProjectStatus(id, status);
    
    const project = projects.value.find(p => p.id === id);
    if (project) {
      project.status = status;
    }
    
  } catch (error) {
    console.error("Błąd zmiany statusu:", error);
    alert("Nie udało się zmienić statusu.");
  } finally {
    done();
  }
};

// PAGINACJA
const currentPage = ref(1);
const itemsPerPage = ref(10);

const toggleRow = (id) => {
  if (expandedRows.value.includes(id)) {
    expandedRows.value = expandedRows.value.filter(rowId => rowId !== id);
  } else {
    expandedRows.value.push(id);
  }
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    expandedRows.value = [];
  }
};

// COMPUTED PROPERTIES
const totalProjects = computed(() => processedProjects.value.length);
const totalPages = computed(() => Math.ceil(totalProjects.value / parseInt(itemsPerPage.value)));

const paginatedProjects = computed(() => {
  const perPage = parseInt(itemsPerPage.value);
  const start = (currentPage.value - 1) * perPage;
  const end = start + perPage;

  return processedProjects.value.slice(start, end); 
});

const pages = computed(() => {
  const pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages.value, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  return pages;
});

const showingStart = computed(() => {
  return (currentPage.value - 1) * itemsPerPage.value + 1;
});

const showingEnd = computed(() => {
  return Math.min(currentPage.value * itemsPerPage.value, totalProjects.value);
});

const newProjectsCount = computed(() => 
  projects.value.filter(p => p.status === 'NOWY').length
);


const handleLogout = () => {
  removeStoredToken();
  router.push('/login');
};
const exportCSV = () => {
  exportProjectsToCSV(projects.value);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

watch(itemsPerPage, () => {
  currentPage.value = 1; // Reset do pierwszej strony przy zmianie ilości na stronie
});

// --- POBIERANIE DANYCH Z BAZY ---
onMounted(async () => {
  const token = getStoredToken();
  
  // Walidacja tokenu i roli
  if (!token || !isTokenValid(token)) {
    alert("Sesja wygasła. Zaloguj się ponownie.");
    router.push('/login');
    return;
  }
  

  isLoading.value = true;

  try {
    // Pobierz projekty i wzory
    const [projectsRes, patternsRes] = await Promise.all([
      adminAPI.getAllProjects(),
      dictionaryAPI.getPatterns()
    ]);
    
    // Zapisujemy wzory do zmiennej
    patternsDict.value = patternsRes.data;

    projects.value = projectsRes.data.map(p => ({
      id: p.id, // UUID
      createdAt: formatDate(p.createdAt),
      rawDate: p.createdAt,
      status: p.status, 

      client: {
        name: p.klient.imieNazwisko || 'Brak danych',
        company: p.klient.firma || '',
        email: p.klient.email,
        phone: p.klient.telefon
      },

      order: {
        quantity: p.iloscSztuk || 0,
        notes: p.uwagiKlienta || 'Brak uwag'
      },

      config: p.konfiguracja || {} 
    }));

  } catch (error) {
    console.error("Błąd pobierania danych:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.clickable-header {
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.clickable-header:hover {
  background-color: rgba(0,0,0,0.02) !important; /* Delikatne podświetlenie */
}

.sort-icon svg {
  display: block;
}

.underline-hover {
  position: relative;
  transition: color 0.3s ease;
}

.underline-hover:hover {
  color: #0d6efd;
}

.underline-hover::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 0;
  height: 2px;
  background: #30303071;
  transition: width 0.3s ease;
}

.underline-hover:hover::after {
  width: 100%;
}

#app{
  width: 100% !important;
}

/* --- TŁO & GLASSMORPHISM --- */
.dashboard-wrapper {
  min-height: 100vh;
  background-color: #ffffff;
  position: relative;
  /* Usuwamy overflow-x: hidden stąd, bo to czasem psuje scrollowanie na mobile. 
     Lepiej dać max-width: 100vw na body globalnie */
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding-bottom: 40px; /* Margines na dole, żeby tabela nie dotykała krawędzi */
}
/* Dekoracyjne bloby w tle */
.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
  opacity: 0.6;
  will-change: transform; /* To pomaga w wydajności */
  pointer-events: none; /* Żeby nie blokowały kliknięć */
}
/* Reszta blobów bez zmian */
.blob-1 { width: 400px; height: 400px; background: #9fdae454; top: -100px; left: -100px; }
.blob-2 { width: 500px; height: 500px; background: #60a5fa45; bottom: -150px; right: -100px; }

.glass-panel {
  background: rgba(255, 255, 255, 0.75);
  /* ZMNIEJSZ BLUR: 20px na dużym obszarze zabija FPS przy scrollowaniu. 
     10px wygląda podobnie a działa dużo szybciej. */
  backdrop-filter: blur(10px); 
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.05);
  position: relative;
  /* USUŃ overflow: hidden stąd, bo to ucinało dropdowny i cienie */
}

.glass-badge {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.05);
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* --- BUTTONS --- */
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

.icon-btn {
  background: transparent;
  border: none;
  color: #9ca3af;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
}
.icon-btn:hover {
  background: rgba(0,0,0,0.05);
  color: #1f2937;
}

/* --- PAGINACJA --- */
.page-link {
  border: 1px solid rgba(0,0,0,0.1);
  color: #6b7280;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.5);
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
}

/* --- TABELA --- */
.custom-table {
  border-collapse: separate;
  border-spacing: 0 8px;
  width: 100%;
  margin-bottom: 0; /* Usuń domyślny margines bootstrapa */
}
.custom-table thead th {
  background: transparent;
  border: none;
  color: #6b7280;
  font-weight: 500;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding-bottom: 12px;
}

.main-row {
  background: rgba(255, 255, 255, 0.6);
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  transition: all 0.2s ease;
  cursor: pointer;
  border-radius: 16px;
}

.main-row td:first-child { border-top-left-radius: 16px; border-bottom-left-radius: 16px; }
.main-row td:last-child { border-top-right-radius: 16px; border-bottom-right-radius: 16px; }

.main-row:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: scale(1.002);
  box-shadow: 0 8px 16px rgba(0,0,0,0.05);
}
.main-row.expanded {
  background: white;
  border-bottom-left-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

/* Miniaturka */
.img-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  background: white;
}
.project-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Status Pills */
.status-pill {
  padding: 6px 14px;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 600;
}
.status-new { background: #e0f2fe; color: #0284c7; }
.status-progress { background: #fef3c7; color: #d97706; }
.status-done { background: #dcfce7; color: #16a34a; }
.status-default { background: #f3f4f6; color: #6b7280; }

/* --- SZCZEGÓŁY (Rozwijane) --- */
.detail-row td {
  border: none !important;
}
.detail-container {
  background: white;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  margin-top: -8px;
  box-shadow: 0 10px 20px -5px rgba(0,0,0,0.05);
  border-top: 1px solid #f3f4f6;
  position: relative;
  z-index: 1;
}

.detail-header {
  color: #9ca3af;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 1px;
  font-weight: 600;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 8px;
}

.text-sm { font-size: 0.875rem; }
.fs-7 { font-size: 0.85rem; }

/* Kropki kolorów */
.color-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: #374151;
}
.color-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid rgba(0,0,0,0.1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.color-dot-sm {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid rgba(0,0,0,0.1);
}

.transition-transform {
  transition: transform 0.3s ease;
}
.rotate-180 {
  transform: rotate(180deg);
}

/* DODANE: Fix dla kontenera tabeli */
.table-responsive {
  /* USUŃ max-height i overflow-y! Niech tabela rośnie naturalnie. */
  /* max-height: 500px;  <-- USUNIĘTE */
  /* overflow-y: auto;   <-- USUNIĘTE */
  
  overflow-x: auto; /* Tylko poziomy scroll na mobile */
  border-radius: 12px;
  -webkit-overflow-scrolling: touch; /* Płynne przewijanie na iOS */
}.main-row {
  /* ... */
  transform: translateZ(0); /* Hack na wydajność renderowania wierszy */
}

/* DODANE: Custom scrollbar */
.table-responsive::-webkit-scrollbar {
  width: 8px;
}

.table-responsive::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.05);
  border-radius: 4px;
}

.table-responsive::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.2);
  border-radius: 4px;
}

.table-responsive::-webkit-scrollbar-thumb:hover {
  background: rgba(0,0,0,0.3);
}
.loading-overlay-table {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 50;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(2px);
  border-radius: 24px; /* Zgodne z glass-panel */
}

.blur-content {
  filter: blur(4px);
  pointer-events: none;
}
/* --- MOBILE DASHBOARD (Karty zamiast Tabeli) --- */
@media (max-width: 600px) {
  
  .glass-panel {
    padding: 15px;
  }

  /* HEADER: Przycisk CSV mniejszy i obok liczników */
  .glass-panel .d-flex.justify-content-between {
    flex-direction: row; /* Wracamy do rzędu */
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }
  
  /* Liczniki (Wszystkie/Nowe) */
  .glass-panel .d-flex.gap-3 {
    width: auto; /* Nie rozpychaj na 100% */
    gap: 8px !important;
  }

  /* Przycisk CSV - mniejszy, auto width */
  .action-btn-primary {
    width: auto;
    padding: 6px 16px;
    font-size: 0.8rem;
  }

  /* --- TABELA JAKO KARTY --- */
  .custom-table thead { display: none; }
  .custom-table, tbody, tr, td { display: block; width: 100%; }

  .main-row {
    margin-bottom: 12px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    border: 1px solid rgba(0,0,0,0.05);
    padding: 12px 16px;
    
    /* Reset radiusów z tabeli */
    border-radius: 16px !important;
  }

  /* --- UKŁAD WEWNĄTRZ KARTY --- */
  .main-row td {
    padding: 6px 0;
    border: none;
    display: flex;
    justify-content: space-between; /* Lewo - Prawo */
    align-items: center;
    text-align: right; /* Treść do prawej */
  }

  /* Etykiety (Po lewej) */
  .main-row td::before {
    content: attr(data-label); /* Można użyć data-atrybutów lub sztywno w CSS */
    font-weight: 600;
    color: #9ca3af;
    font-size: 0.75rem;
    text-transform: uppercase;
    text-align: left;
    margin-right: auto; /* Popycha treść w prawo */
  }
  
  /* Definicje etykiet dla konkretnych kolumn */
  .main-row td:nth-of-type(1)::before { content: "ID / Data"; }
  /* Miniaturka (2) nie ma etykiety */
  .main-row td:nth-of-type(3)::before { content: "Klient"; }
  .main-row td:nth-of-type(4)::before { content: "Kontakt"; }
  .main-row td:nth-of-type(5)::before { content: "Ilość"; }
  .main-row td:nth-of-type(6)::before { content: "Status"; }

  /* 1. ID (Pierwszy wiersz) */
  .main-row td:nth-of-type(1) {
    border-bottom: 1px solid #f3f4f6;
    padding-bottom: 8px;
    margin-bottom: 8px;
  }

  /* 2. Miniaturka (Wyrzucamy pod ID, na całą szerokość lub środek) */
  .main-row td:nth-of-type(2) {
    justify-content: center; /* Centrujemy miniaturkę */
    padding: 10px 0;
  }
  .main-row td:nth-of-type(2)::before { display: none; } /* Bez etykiety */
  
  .thumbnail-container {
    margin: 0 auto; /* Centrowanie diva z miniaturką */
  }


  /* 4. AKCJE (Ikony na samym dole) */
  .main-row td:last-child {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f3f4f6; /* Linia oddzielająca */
    justify-content: center; /* Wycentrowane ikony */
    gap: 20px; /* Odstęp między ikonami */
  }
  .main-row td:last-child::before { display: none; } 

  .icon-btn {
    width: 40px;
    height: 40px;
    background: #f8f9fa;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
  }

  .mobile-pagination-row {
    justify-content: center !important; 
  }
  .page-link {
    padding: 4px 10px;
    font-size: 0.85rem;
  }
  header{
    padding:25px;
  }
}
</style>