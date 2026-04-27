import { ref, computed, watch } from 'vue';
import { adminAPI, dictionaryAPI } from '../../../utils/axios';
import { exportProjectsToCSV } from '../../../utils/csvExport.js';

export function useAdminOrders() {
  const projects = ref([]);
  const patternsDict = ref([]);
  const isLoading = ref(false);

  // Pagination & Filtering state
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const totalProjects = ref(0); // Będzie używane do backend paginacji
  
  const searchFilter = ref({ type: 'name', query: '' });
  const currentSort = ref('createdAt');
  const currentSortDir = ref('desc');

  // Wskazuje czy dostajemy pełne dane (Array) i musimy stronicować lokalnie
  // Zakładamy na start lokalne stronicowanie dla kompatybilności wstecznej
  const isLocalPagination = ref(true); 

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

  const getPatternName = (id) => {
    if (!id) return 'BRAK';
    const pattern = patternsDict.value.find(p => p.id == id);
    return pattern ? (pattern.name || pattern.nazwa) : `ID: ${id}`;
  };

  const fetchData = async () => {
    isLoading.value = true;
    try {
   
      const params = {
        page: currentPage.value - 1, 
        size: itemsPerPage.value,
        sort: `${currentSort.value},${currentSortDir.value}`,
        ...(searchFilter.value.query ? { search: searchFilter.value.query, searchType: searchFilter.value.type } : {})
      };

      const [projectsRes, patternsRes] = await Promise.all([
        adminAPI.getAllProjects(params),
        dictionaryAPI.getPatterns()
      ]);
      
      patternsDict.value = patternsRes.data;
      
      let rawData = [];
      
      // Sprawdzenie czy backend odpowiedział paginacją (w Springu przeważnie obiekt json.content)
      if (projectsRes.data && projectsRes.data.content) {
        rawData = projectsRes.data.content;
        totalProjects.value = projectsRes.data.totalElements;
        isLocalPagination.value = false;
      } else {
        // Fallback: Backend (na razie) odesłał List<Project>
        rawData = projectsRes.data;
        isLocalPagination.value = true;
      }

      // Mapowanie modelu backendowego na potrzebny frontowi obiekt
      projects.value = rawData.map((p) => ({
        id: p.id,
        createdAt: formatDate(p.createdAt),
        rawDate: p.createdAt,
        status: p.status,
        client: {
          name: p.klient?.imieNazwisko || 'Brak danych',
          company: p.klient?.firma || '',
          email: p.klient?.email,
          phone: p.klient?.telefon
        },
        order: {
          quantity: p.iloscSztuk || 0,
          notes: p.uwagiKlienta || 'Brak uwag'
        },
        config: p.konfiguracja || {}
      }));

    } catch (error) {
      console.error("Błąd pobierania danych:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // ----- LOKALNE PRZETWARZANIE (Zostaje dla kompatybilności dopóki na serwerze nie ma strony) -----
  const processedProjects = computed(() => {
    // Jeśli używamy backendowej paginacji, odsyłamy obiekty as-is
    if (!isLocalPagination.value) return projects.value;

    let result = [...projects.value];

    // Lokalny Filt
    if (searchFilter.value.query) {
      const query = searchFilter.value.query.toLowerCase();
      result = result.filter(project => {
        switch(searchFilter.value.type) {
          case 'name': return project.client.name.toLowerCase().includes(query);
          case 'email': return (project.client.email || '').toLowerCase().includes(query);
          case 'date': return project.createdAt.includes(query);
          case 'id': return project.id.toString().toLowerCase().includes(query);
          default: return true;
        }
      });
    }

    // Lokalne Sortowanie
    result.sort((a, b) => {
      let modifier = currentSortDir.value === 'desc' ? -1 : 1;
      if (currentSort.value === 'createAt') {
        return (new Date(a.rawDate) - new Date(b.rawDate)) * modifier;
      } else if (currentSort.value === 'status') {
        return a.status.localeCompare(b.status) * modifier;
      }
      return 0;
    });

    return result;
  });

  const paginatedProjects = computed(() => {
    if (!isLocalPagination.value) return processedProjects.value;

    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return processedProjects.value.slice(start, end);
  });

  const displayedTotalProjects = computed(() => {
    return isLocalPagination.value ? processedProjects.value.length : totalProjects.value;
  });

  const totalPages = computed(() => Math.ceil(displayedTotalProjects.value / itemsPerPage.value));

  // Akcje Panelowe
  const handleSort = (column) => {
    if (currentSort.value === column) {
      currentSortDir.value = currentSortDir.value === 'asc' ? 'desc' : 'asc';
    } else {
      currentSort.value = column;
      currentSortDir.value = 'asc';
    }
    if (!isLocalPagination.value) fetchData(); // jeśli backendowe, to pobieraj znów
  };

  const handleSearch = ({ type, query }) => {
    searchFilter.value = { type, query };
    currentPage.value = 1;
    if (!isLocalPagination.value) fetchData();
  };

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      if (!isLocalPagination.value) fetchData();
    }
  };

  const setParams = (newItemsPerPage) => {
     itemsPerPage.value = newItemsPerPage;
     currentPage.value = 1;
     if (!isLocalPagination.value) fetchData();
  }

  const exportCSV = () => {
    exportProjectsToCSV(isLocalPagination.value ? processedProjects.value : projects.value);
  };

  const toggleStatus = async ({ id, status, done }) => {
    try {
      await adminAPI.updateProjectStatus(id, status);
      const project = projects.value.find(p => p.id === id);
      if (project) project.status = status;
    } catch (error) {
      console.error("Błąd zmiany statusu:", error);
      alert("Nie udało się zmienić statusu.");
    } finally {
      done();
    }
  };

  const newProjectsCount = computed(() => 
    projects.value.filter(p => p.status === 'NOWY').length
  );

  return {
    // Stan
    projects: paginatedProjects,
    isLoading,
    currentPage,
    itemsPerPage,
    totalPages,
    totalProjects: displayedTotalProjects,
    newProjectsCount,
    currentSort,
    currentSortDir,
    patternsDict,
    
    // Metody
    fetchData,
    handleSort,
    handleSearch,
    changePage,
    setParams,
    getPatternName,
    exportCSV,
    toggleStatus
  };
}
