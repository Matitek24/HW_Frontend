<template>
  <div class="dashboard-wrapper">
    <div class="bg-blob blob-1"></div>
    <div class="bg-blob blob-2"></div>

    <div class="container-fluid px-xxl-5 position-relative z-1">
      
      <header class="d-flex justify-content-between align-items-center py-5 mb-3">
        <div>
          <h1 class="display-6 fw-bold text-dark mb-0" style="letter-spacing: -1px;">Zamówienia</h1>
          <p class="text-muted fw-light">Panel zarządzania projektami</p>
        </div>
        <button @click="handleLogout" class="glass-btn-logout">
          Wyloguj
        </button>
      </header>

      <div class="glass-panel p-4 p-lg-5">
        
        <div class="d-flex justify-content-between align-items-center mb-5">
          <div class="d-flex gap-3 align-items-center">
            <span class="badge glass-badge text-dark px-3 py-2 rounded-pill">Wszystkie: {{ projects.length }}</span>
            <span class="badge glass-badge text-success px-3 py-2 rounded-pill">Nowe: {{ newProjectsCount }}</span>
          </div>
          <div>
            <button class="action-btn-primary shadow-sm" @click="exportCSV">
              Eksportuj CSV
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle custom-table">
            <thead>
              <tr>
                <th class="ps-4">ID / Data</th>
                <th>Wizualizacja</th>
                <th>Klient</th>
                <th>Kontakt</th>
                <th>Ilość</th>
                <th>Status</th>
                <th class="text-end pe-4">Akcje</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="project in projects" :key="project.id">
                <tr 
                  class="main-row" 
                  :class="{ 'expanded': expandedRows.includes(project.id) }"
                  @click="toggleRow(project.id)"
                >
                  <td class="ps-4">
                    <div class="fw-bold text-dark">#{{ project.id }}</div>
                    <small class="text-muted fw-light">{{ project.createdAt }}</small>
                  </td>
                  
                  <td>
                    <div class="img-wrapper">
                      <img :src="thumbnailUrl" alt="Projekt" class="project-thumb">
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
                      <a :href="`mailto:${project.client.email}`" class="text-decoration-none text-secondary fs-7">
                        {{ project.client.email }}
                      </a>
                      <a :href="`tel:${project.client.phone}`" class="text-decoration-none text-secondary fs-7">
                        {{ project.client.phone }}
                      </a>
                    </div>
                  </td>

                  <td>
                    <span class="fw-bold fs-5">{{ project.order.quantity }}</span>
                    <small class="text-muted ms-1">szt.</small>
                  </td>
                  
                  <td>
                    <span :class="['status-pill', getStatusClass(project.status)]">
                      {{ project.status }}
                    </span>
                  </td>

                  <td class="text-end pe-4">
                    <button class="icon-btn me-2" title="Pobierz PDF" @click.stop>
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
                              <span>Góra: {{ project.config.patterns.top }}</span>
                              <span>Dół: {{ project.config.patterns.bottom }}</span>
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import thumbnailImg from '../assets/miniaturka.jpg'; 
import { getStoredToken, removeStoredToken, isTokenValid, isAdmin } from '../utils/jwt';
import { adminAPI } from '../utils/axios'; // Import API

const router = useRouter();
const projects = ref([]);
const expandedRows = ref([]);
const thumbnailUrl = ref(thumbnailImg);
const isLoading = ref(false); // Dodajmy loader

const toggleRow = (id) => {
  if (expandedRows.value.includes(id)) {
    expandedRows.value = expandedRows.value.filter(rowId => rowId !== id);
  } else {
    expandedRows.value.push(id);
  }
};

const newProjectsCount = computed(() => 
  projects.value.filter(p => p.status === 'NOWY').length
);

// Mapowanie statusów z bazy (NOWY) na klasy CSS
const getStatusClass = (status) => {
  switch(status) {
    case 'NOWY': return 'status-new';
    case 'W_REALIZACJI': return 'status-progress';
    case 'ZAKONCZONY': return 'status-done';
    default: return 'status-default';
  }
};

const handleLogout = () => {
  removeStoredToken();
  router.push('/');
};

const exportCSV = () => {
  console.log('Eksport CSV - do zrobienia');
};

// Formatowanie daty z Javy (ISO string)
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

// --- POBIERANIE DANYCH Z BAZY ---
onMounted(async () => {
  const token = getStoredToken();
  
  // Walidacja tokenu i roli
  if (!token || !isTokenValid(token)) {
    router.push('/');
    return;
  }
  
  if (!isAdmin(token)) {
    alert("Brak uprawnień administratora");
    router.push('/'); // lub gdzieś indziej
    return;
  }

  isLoading.value = true;

  try {
    // Pobierz projekty z API
    const response = await adminAPI.getAllProjects();
    
    // Mapujemy dane z backendu na strukturę widoku
    projects.value = response.data.map(p => ({
      id: p.id, // UUID
      createdAt: formatDate(p.createdAt),
      status: p.status, // np. "NOWY"
      
      // Dane klienta z relacji
      client: {
        name: p.klient.imieNazwisko || 'Brak danych',
        company: p.klient.firma || '',
        email: p.klient.email,
        phone: p.klient.telefon
      },
      
      // Ilość i uwagi z głównej tabeli
      order: {
        quantity: p.iloscSztuk || 0,
        notes: p.uwagiKlienta || 'Brak uwag'
      },
      
      // Konfiguracja z JSONB (Spring automatycznie zamienił to na obiekt)
      config: p.konfiguracja || {} 
    }));

  } catch (error) {
    console.error("Błąd pobierania projektów:", error);
    // Opcjonalnie: obsługa 403 jeśli token wygasł
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
  #app{
    width: 100% !important;
  }
/* --- TŁO & GLASSMORPHISM --- */
.dashboard-wrapper {
  min-height: 100vh;
  background-color: #ffffff;
  position: relative;
  overflow-x: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Dekoracyjne bloby w tle */
.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
  opacity: 0.6;
}
.blob-1 {
  width: 400px;
  height: 400px;
  background: #9fdae454; /* fiolet */
  top: -100px;
  left: -100px;
}
.blob-2 {
  width: 500px;
  height: 500px;
  background: #60a5fa45; /* niebieski */
  bottom: -150px;
  right: -100px;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.05);
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

/* --- TABELA --- */
.custom-table {
  border-collapse: separate;
  border-spacing: 0 8px; /* Odstęp między wierszami */
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
/* Hack na zaokrąglone rogi wiersza tabeli */
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
  margin-top: -8px; /* Dosuń do wiersza głównego */
  box-shadow: 0 10px 20px -5px rgba(0,0,0,0.05);
  border-top: 1px solid #f3f4f6;
  position: relative;
  z-index: 1; /* Poniżej głównego wiersza wizualnie */
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
</style>