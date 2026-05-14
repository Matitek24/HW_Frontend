<template>
  <div class="dashboard-wrapper">
    <div class="blobs-container">
      <div class="bg-blob blob-1"></div>
      <div class="bg-blob blob-2"></div>
    </div>

    <div class="container-fluid px-4 px-lg-5 px-xxl-6 position-relative z-1">
      
      <header class="d-flex justify-content-between align-items-center py-5 mb-3">
        <div>
          <div class="d-flex align-items-center gap-3">
            <h1 class="display-6 fw-bold text-dark mb-0" style="letter-spacing: -1px;">Analityka Leadów</h1>
            <span class="badge glass-badge text-dark px-3 py-2 rounded-pill" style="font-size: 0.9rem;">Razem: {{ filteredLeads.length }}</span>
          </div>
          <p class="text-muted fw-light mt-1">Śledzenie pobrań PDF</p>
        </div>
        <button @click="handleLogout" class="glass-btn-logout">
          Wyloguj
        </button>
      </header>

      <div class="row g-4 mb-4">
        <div class="col-12">
          <div class="glass-panel p-4">
            <h5 class="fw-bold mb-3">Dzienne pobrania PDF</h5>
            <div class="chart-container" style="min-height: 250px;">
               <apexchart 
                 v-if="chartOptions && chartSeries"
                 type="line" 
                 height="250" 
                 :options="chartOptions" 
                 :series="chartSeries"
               ></apexchart>
               <div v-else-if="isLoading" class="text-center py-5">
                 <div class="spinner text-primary" role="status"></div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div class="glass-panel p-4 p-lg-5">
        
        <div class="d-flex justify-content-between align-items-center mb-5">
          <div class="d-flex gap-3 align-items-center w-100 max-w-md">
            <!-- Wyszukiwarka po domenie -->
            <div class="search-wrapper flex-grow-1" style="max-width: 400px;">
              <div class="input-group">
                <span class="input-group-text glass-input-group border-end-0 bg-transparent">
                  <i class="fa-solid fa-magnifying-glass text-muted"></i>
                </span>
                <input 
                  type="text" 
                  class="form-control glass-input border-start-0" 
                  placeholder="Filtruj po adresie e-mail lub domenie..."
                  v-model="searchQuery"
                >
              </div>
            </div>
          </div>
          <div>
             <button class="action-btn-primary shadow-sm" @click="fetchLeads">
              Odśwież
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="loading-overlay-table">
          <div class="spinner text-primary" role="status"></div>
        </div>

        <!-- Tabela -->
        <div class="table-responsive" :class="{ 'blur-content': isLoading }">
          <table class="table align-middle custom-table table-hover">
            <thead>
              <tr>
                <th class="ps-4">Adres E-mail</th>
                <th>Liczba Pobrań</th>
                <th>Ostatnia Aktywność</th>
                <th class="text-end pe-4">Status</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="lead in filteredLeads" :key="lead.email" class="main-row">
                <td class="ps-4">
                  <span class="fw-bold text-dark">{{ lead.email }}</span>
                </td>
                <td>
                  <span class="fw-bold fs-5">{{ lead.downloadCount || lead.download_count }}</span>
                </td>
                <td>
                  <span class="text-muted">{{ formatDate(lead.lastActivityDate || lead.last_activity_date) }}</span>
                </td>
                <td class="text-end pe-4">
                  <span v-if="(lead.downloadCount || lead.download_count) > 10" class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-2 rounded-pill">
                    <i class="fa-solid fa-fire me-1"></i> Aktywny
                  </span>
                  <span v-else class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-3 py-2 rounded-pill">
                    Standardowy
                  </span>
                </td>
              </tr>
              <tr v-if="filteredLeads.length === 0 && !isLoading">
                 <td colspan="4" class="text-center py-5 text-muted fw-light">
                    Brak leadów do wyświetlenia.
                 </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>

    <AdminDock />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { removeStoredToken, getStoredToken, isTokenValid } from '../utils/jwt';
import { adminAnalyticsAPI } from '../utils/axios';
import AdminDock from '../components/dashboard/admin/AdminDock.vue';
import VueApexCharts from 'vue3-apexcharts';

const apexchart = VueApexCharts;

const router = useRouter();
const leads = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const chartSeries = ref([]);
const chartOptions = ref(null);

const filteredLeads = computed(() => {
  if (!searchQuery.value) return leads.value;
  const q = searchQuery.value.toLowerCase();
  return leads.value.filter(lead => lead.email.toLowerCase().includes(q));
});

const fetchLeads = async () => {
  isLoading.value = true;
  try {
    const response = await adminAnalyticsAPI.getLeads('lastActivityDate');
    leads.value = response.data;
  } catch (error) {
    console.error("Błąd podczas pobierania leadów:", error);
    if (error.status === 401 || error.status === 403) {
      alert("Brak dostępu.");
    }
  } finally {
    isLoading.value = false;
  }
};

const fetchStats = async () => {
  try {
    const response = await adminAnalyticsAPI.getDailyStats();
    const data = response.data;
    const categories = data.map(item => item.date);
    const seriesData = data.map(item => item.count);

    chartSeries.value = [
      { name: 'Słupki', type: 'column', data: seriesData },
      { name: 'Trend', type: 'line', data: seriesData }
    ];

    chartOptions.value = {
      chart: { type: 'line', fontFamily: 'Inter, sans-serif', toolbar: { show: false }, zoom: { enabled: false }, background: 'transparent' },
      colors: ['#0ea5e9', '#f59e0b'],
      dataLabels: { enabled: false },
      stroke: { width: [0, 4], curve: 'smooth' },
      fill: { type: ['solid', 'solid'], opacity: [0.85, 1] },
      xaxis: { categories: categories, labels: { style: { colors: '#6b7280' } }, axisBorder: { show: false }, axisTicks: { show: false } },
      yaxis: { labels: { style: { colors: '#6b7280' }, formatter: (val) => Math.round(val) } },
      grid: { borderColor: 'rgba(0,0,0,0.05)', strokeDashArray: 4, yaxis: { lines: { show: true } }, xaxis: { lines: { show: false } } },
      theme: { mode: 'light' },
      tooltip: { theme: 'light', y: { formatter: (val) => val + " pobrań" } }
    };
  } catch (error) {
    console.error("Błąd statystyk:", error);
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const handleLogout = () => {
  removeStoredToken();
  router.push('/login');
};

onMounted(async () => {
  const token = getStoredToken();
  if (!token || !isTokenValid(token)) {
    router.push('/login');
    return;
  }
  await Promise.all([fetchLeads(), fetchStats()]);
});
</script>

<style scoped>
.dashboard-wrapper {
  min-height: 100vh;
  background-color: #ffffff;
  position: relative;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding-bottom: 100px; 
}

.blobs-container {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
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

.glass-input-group {
  background: rgba(255, 255, 255, 0.6);
  border-color: rgba(0,0,0,0.1);
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}

.glass-input {
  background: rgba(255, 255, 255, 0.6);
  border-color: rgba(0,0,0,0.1);
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
  box-shadow: none !important;
}

.glass-input:focus {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(0,0,0,0.2);
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

/* Style Tabeli */
.custom-table {
  width: 100%;
  margin-bottom: 0;
  border-collapse: collapse;
}

.custom-table thead th {
  background: transparent;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  color: #6b7280;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 16px 12px;
}

.main-row {
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.main-row td {
  padding: 16px 12px;
  vertical-align: middle;
}

.main-row:hover {
  background: rgba(0, 0, 0, 0.02);
}

.blur-content {
  filter: blur(4px);
  pointer-events: none;
}
</style>
