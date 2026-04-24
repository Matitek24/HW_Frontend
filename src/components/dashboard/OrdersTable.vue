<template>
  <div class="table-responsive" :class="{ 'blur-content': isLoading }">
    <table class="table align-middle custom-table" :class="{ 'table-hover': !isMobile }">
      <thead>
        <tr>
          <!-- ID / Data -->
          <th class="ps-4 clickable-header" @click="emitSort('date')">
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
          
          <!-- Status -->
          <th class="clickable-header" @click="emitSort('status')">
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
        <template v-for="project in projects" :key="project.id">
          <tr 
            class="main-row" 
            :class="{ 'expanded': expandedRows.includes(project.id) }"
            @click="toggleRow(project.id)"
          >
            <td class="ps-4">
              <router-link
                :to="`/projekt/${project.id}`"
                class="fw-bold text-dark text-decoration-none underline-hover"
                @click.stop
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
                class="img-wrapper" 
                style="width: 60px; height: 60px; padding: 5px"
              >
                <HatThumbnail 
                  :config="project.config" 
                  :patternsDict="patternsDict"
                  class="d-flex"
                />
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
                <span class="text-secondary fs-7">{{ project.client.email }}</span>
                <span class="text-secondary fs-7">{{ project.client.phone }}</span>
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
                  @statusChanged="$emit('statusChanged', $event)"
                />
              </div>
            </td>

            <td class="text-end pe-4">
              <button 
                class="icon-btn me-2" 
                title="Pobierz Kartę Produkcyjną" 
                @click.stop="$emit('downloadPdf', project)" 
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </button>
              <button 
                class="icon-btn transition-transform" 
                :class="{'rotate-180': expandedRows.includes(project.id)}"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
            </td>
          </tr>

          <OrderRowDetails 
            v-if="expandedRows.includes(project.id)" 
            :project="project" 
            :getPatternName="getPatternName"
          />
        </template>
      </tbody>
    </table>

    <div v-if="projects.length === 0 && !isLoading" class="text-center py-5 text-muted fw-light">
      Brak zamówień do wyświetlenia.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import HatThumbnail from '../hat/HatThumbnail.vue';
import StatusBadge from '../admin/StatusBadge.vue';
import OrderRowDetails from './OrderRowDetails.vue';

const props = defineProps({
  projects: { type: Array, required: true },
  patternsDict: { type: Array, required: true },
  isLoading: { type: Boolean, default: false },
  currentSort: { type: String, required: true },
  currentSortDir: { type: String, required: true },
  getPatternName: { type: Function, required: true }
});

const emit = defineEmits(['sort', 'statusChanged', 'downloadPdf']);

const expandedRows = ref([]);
const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 650;
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

const toggleRow = (id) => {
  if (expandedRows.value.includes(id)) {
    expandedRows.value = expandedRows.value.filter(rowId => rowId !== id);
  } else {
    expandedRows.value.push(id);
  }
};

const emitSort = (column) => {
  emit('sort', column);
};
</script>

<style scoped>
.custom-table {
  border-collapse: separate;
  border-spacing: 0 8px;
  width: 100%;
  margin-bottom: 0;
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

.clickable-header {
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.clickable-header:hover {
  background-color: rgba(0,0,0,0.02) !important;
}

.sort-icon svg {
  display: block;
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

.img-wrapper {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  background: white;
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

.blur-content {
  filter: blur(4px);
  pointer-events: none;
}
.rotate-180 { transform: rotate(180deg); }
.transition-transform { transition: transform 0.2s; }
.fs-7 { font-size: 0.85rem; }
</style>
