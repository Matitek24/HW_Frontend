<template>
    <div>
      <!-- Pasek narzędzi: Szablon i Instrukcja -->
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div class="d-flex flex-wrap gap-2">
          <button class="glass-btn d-flex align-items-center gap-2" @click="downloadTemplate">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Pobierz szablon SVG
          </button>
          <button class="glass-btn d-flex align-items-center gap-2" @click="showInstructionsModal = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            Instrukcja przygotowania pliku
          </button>
        </div>
      </div>
  
      <!-- Formularz dodawania wzoru -->
      <div class="row mb-5 align-items-end bg-light p-4 rounded-4 shadow-sm border border-white">
        <div class="col-md-3">
          <label class="form-label text-muted small fw-bold">NAZWA WZORU</label>
          <input
            type="text"
            v-model="newPattern.nazwa"
            class="form-control"
            placeholder="np. Norweskie Renifery"
            @keyup.enter="addPattern"
          />
        </div>
        <div class="col-md-3">
          <label class="form-label text-muted small fw-bold">KATEGORIA</label>
          <select v-model="newPattern.kategoria" class="form-select">
            <option value="TOP">Góra Czapki (Top)</option>
            <option value="BOTTOM">Dół (Bottom)</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label text-muted small fw-bold">PLIK SVG</label>
          <input
            ref="fileInput"
            type="file"
            accept=".svg"
            class="form-control"
            @change="handleFileUpload"
          />
        </div>
        <div class="col-md-3 d-flex justify-content-end">
          <button
            class="tab-btn active"
            :disabled="isLoading || !newPattern.kodSvg"
            @click="addPattern"
          >
            + Dodaj wzór
          </button>
        </div>
      </div>
  
      <!-- Loader -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
  
      <!-- Tabela wzorów -->
      <div v-else class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr class="text-muted small">
              <th>ID</th>
              <th>PODGLĄD</th>
              <th>NAZWA</th>
              <th>KATEGORIA</th>
              <th>STATUS</th>
              <th class="text-end">AKCJE</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="wzor in paginatedPatterns" :key="wzor.id">
              <td class="text-muted">#{{ wzor.id }}</td>
              <td>
                <div
                  class="pattern-thumbnail-wrapper"
                  title="Kliknij, aby powiększyć"
                  @click="openPreviewModal(wzor)"
                >
                  <img
                    :src="generateSvgDataUrl(wzor.kodSvg)"
                    class="pattern-thumbnail"
                    alt="Wzór"
                  />
                  <div class="zoom-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      <line x1="11" y1="8" x2="11" y2="14"></line>
                      <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                  </div>
                </div>
              </td>
              <td class="fw-medium">{{ wzor.nazwa }}</td>
              <td><span class="badge bg-light text-dark border">{{ wzor.kategoria }}</span></td>
              <td>
                <span
                  class="badge"
                  :class="wzor.isActive ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'"
                >
                  {{ wzor.isActive ? 'Widoczny' : 'Ukryty' }}
                </span>
              </td>
              <td class="text-end">
                <button @click="toggleStatus(wzor)" class="glass-btn glass-btn-sm me-2">
                  {{ wzor.isActive ? 'Ukryj' : 'Pokaż' }}
                </button>
                <button @click="deletePattern(wzor.id)" class="glass-btn glass-btn-sm glass-btn-danger">
                  Usuń
                </button>
              </td>
            </tr>
            <tr v-if="patterns.length === 0">
              <td colspan="6" class="text-center text-muted py-4">Brak wzorów w bazie.</td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Paginacja -->
      <div v-if="totalPages > 1" class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-3">
        <button class="glass-btn glass-btn-sm" :disabled="currentPage === 1" @click="currentPage--">
          Poprzednia
        </button>
        <span class="text-muted small">Strona {{ currentPage }} z {{ totalPages }}</span>
        <button class="glass-btn glass-btn-sm" :disabled="currentPage === totalPages" @click="currentPage++">
          Następna
        </button>
      </div>
  
      <!-- Modal z dużym podglądem -->
      <Transition name="fade">
        <div v-if="previewPattern" class="modal-overlay" @click.self="closePreviewModal">
          <div class="glass-modal-content p-4 text-center">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="mb-0 fw-bold">{{ previewPattern.nazwa }}</h4>
              <button class="btn-close" @click="closePreviewModal"></button>
            </div>
  
            <div
              class="bg-light border rounded-3 p-3 d-flex justify-content-center align-items-center"
              style="min-height: 250px;"
            >
            <svg :viewBox="HAT_VIEWBOX" style="width: 100%; max-width: 600px; height: auto;">
                <!-- Dodano :style="{ color: PREVIEW_COLOR }" -->
                <g class="preview-group" :fill="PREVIEW_COLOR" :style="{ color: PREVIEW_COLOR }" v-html="previewPattern.kodSvg"></g>
                </svg>
            </div>
          </div>
        </div>
      </Transition>
  
    <!-- Modal z Instrukcją -->
    <Transition name="fade">
      <div v-if="showInstructionsModal" class="modal-overlay" @click.self="showInstructionsModal = false">
        <div class="glass-modal-content p-5 text-start">
          <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3">
            <h5 class="mb-0 fw-bold">Instrukcja przygotowania pliku SVG</h5>
            <button class="btn-close" @click="showInstructionsModal = false"></button>
          </div>
          
          <div class="text-muted">
            <p>Aby wzór prawidłowo działał w konfiguratorze, przygotuj plik SVG według poniższych kroków:</p>
            
            <ol class="ps-3 mb-4">
              <li class="mb-3">
                <strong>Wymiary obszaru roboczego:</strong> Ustaw obszar na dokładnie <b>1316.28 x 800.63 px</b>. Najlepiej pobierz nasz gotowy szablon, który ma już te proporcje oraz punkty stabilizujące.
              </li>
              <li class="mb-3">
                <strong>Wklej wzór:</strong> Umieść wektor ze swoim wzorem (np. tak jak przygotowane oczy[cite: 10]) na szablonie w docelowym miejscu.
              </li>
              <li class="mb-3">
                <strong>Zaznacz wszystko:</strong> Wciśnij <b>Ctrl + A</b> (Mac: <b>Cmd + A</b>), aby zaznaczyć całą zawartość obszaru roboczego.
              </li>
              <li class="mb-3">
                <strong>Spłaszcz obiekty:</strong> Z górnego menu wybierz <b>Obiekt &rarr; Rozwinięcie...</b> (Object &rarr; Expand). Zaznacz „Wypełnienie” i „Obrys”, a następnie kliknij OK.
              </li>
              <li class="mb-2">
                <strong>Zapisz jako SVG:</strong> Wybierz opcję Plik &rarr; Eksportuj jako (format SVG). W okienku opcji ustaw:
                <ul class="mt-2">
                  <li>Styl: <b>Atrybuty prezentacji</b></li>
                  <li>Responsywny: <b>Odznaczone</b> (puste okienko)</li>
                  <li>Zminimalizuj: <b>Zaznaczone</b></li>
                </ul>
              </li>
            </ol>
          </div>
          
          <div class="text-end pt-2">
            <button class="btn btn-dark px-4 py-2 rounded-3" @click="showInstructionsModal = false">
              Rozumiem
            </button>
          </div>
        </div>
      </div>
    </Transition>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, onMounted } from 'vue';
  import { adminDictionaryAPI } from '../../../utils/axios';
  
  const HAT_VIEWBOX = '0 0 1316.28 800.63';
  const PREVIEW_COLOR = '#1f2937';
  const THUMBNAIL_COLOR = '#4b5563';
  
  const patterns = ref([]);
  const isLoading = ref(false);
  const fileInput = ref(null);
  const previewPattern = ref(null);
  const showInstructionsModal = ref(false); // Stan modala instrukcji
  
  const newPattern = ref({
    nazwa: '',
    kategoria: 'TOP',
    kodSvg: '',
    isActive: true
  });
  
  // --- POBIERANIE SZABLONU (Metoda 4 kropek) ---
 // --- POBIERANIE SZABLONU (Plik statyczny) ---
const downloadTemplate = () => {
  const link = document.createElement('a');
  // Ukośnik na początku odnosi się bezpośrednio do zawartości folderu public/
  link.href = '/szablon.svg'; 
  link.download = 'szablon_wzoru_czapka.svg';
  document.body.appendChild(link);
  link.click();
  link.remove();
};
  
  // --- PAGINACJA ---
  const currentPage = ref(1);
  const itemsPerPage = 10;
  
  const totalPages = computed(() => Math.ceil(patterns.value.length / itemsPerPage));
  
  const paginatedPatterns = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return patterns.value.slice(start, start + itemsPerPage);
  });
  
  watch(totalPages, (newTotal) => {
    if (currentPage.value > newTotal && newTotal > 0) {
      currentPage.value = newTotal;
    }
  });
  
  // --- MINIATURA: SVG -> data URL ---
  const generateSvgDataUrl = (rawSvgPaths) => {
    if (!rawSvgPaths) return '';
    const svgString =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${HAT_VIEWBOX}">` +
      `<g fill="${THUMBNAIL_COLOR}">${rawSvgPaths}</g></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
  };
  
  // --- MODAL ---
  const openPreviewModal = (pattern) => {
    previewPattern.value = pattern;
  };
  const closePreviewModal = () => {
    previewPattern.value = null;
  };
 // --- PARSER SVG (Wersja Ostateczna) ---
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const doc = new DOMParser().parseFromString(e.target.result, 'image/svg+xml');
      const svgElement = doc.querySelector('svg');
      if (!svgElement) throw new Error('Nie znaleziono tagu <svg>');

      // Usuwamy globalne tagi style i śmieci od Illustratora
      svgElement
        .querySelectorAll('style, title, desc, defs, metadata, script, foreignObject')
        .forEach(el => el.remove());

      svgElement.querySelectorAll('*').forEach(el => {
        // RATUNEK: Wyciąganie stylów wpisanych jako inline CSS (np. style="stroke: #000;")
        const inlineStyle = el.getAttribute('style') || '';
        let styleFill = null;
        let styleStroke = null;
        
        if (inlineStyle) {
          const fillMatch = inlineStyle.match(/fill:\s*([^;]+)/i);
          if (fillMatch) styleFill = fillMatch[1].trim();
          
          const strokeMatch = inlineStyle.match(/stroke:\s*([^;]+)/i);
          if (strokeMatch) styleStroke = strokeMatch[1].trim();
        }

        // 1. Obsługa WYPEŁNIENIA (Fill)
        const fill = el.getAttribute('fill') || styleFill;
        if (fill) {
          const f = fill.toLowerCase();
          // Zachowujemy przezroczystość/biel jako puste pole
          if (f === 'none' || f === 'transparent' || f === '#ffffff' || f === '#fff' || f === 'white') {
            el.setAttribute('fill', 'none');
          } else {
            // Usuwamy narzucony kolor, by kształt przyjął docelowy kolor czapki
            el.removeAttribute('fill');
          }
        }

        // 2. Obsługa OBRYSU (Stroke)
        const stroke = el.getAttribute('stroke') || styleStroke;
        if (stroke) {
          const s = stroke.toLowerCase();
          if (s !== 'none' && s !== 'transparent' && s !== '#ffffff' && s !== '#fff' && s !== 'white') {
            // Nadajemy dynamiczny kolor z CSS
            el.setAttribute('stroke', 'currentColor');
          } else {
            // Wymuszamy brak obrysu
            el.setAttribute('stroke', 'none');
          }
        }

        // Bezpieczne usunięcie starych atrybutów
        ['class', 'style', 'id'].forEach(attr => el.removeAttribute(attr));
        
        // Zabezpieczenie przed złośliwym kodem (XSS)
        [...el.attributes].forEach(attr => {
          const isHandler = attr.name.toLowerCase().startsWith('on');
          const isJsHref = /^\s*javascript:/i.test(attr.value);
          if (isHandler || isJsHref) el.removeAttribute(attr.name);
        });
      });

      newPattern.value.kodSvg = svgElement.innerHTML.trim();
    } catch (err) {
      alert('Błąd: ' + err.message);
      newPattern.value.kodSvg = '';
    }
  };
  reader.readAsText(file);
};
  
  // --- API CRUD ---
  const fetchPatterns = async () => {
    isLoading.value = true;
    try {
      const response = await adminDictionaryAPI.getPatterns();
      patterns.value = response.data;
    } catch (error) {
      console.error('Błąd pobierania wzorów:', error);
    } finally {
      isLoading.value = false;
    }
  };
  
  const addPattern = async () => {
    if (!newPattern.value.nazwa.trim()) return alert('Podaj nazwę wzoru!');
    if (!newPattern.value.kodSvg) return alert('Wgraj plik SVG!');
  
    isLoading.value = true;
    try {
      await adminDictionaryAPI.addPattern({
        ...newPattern.value,
        nazwa: newPattern.value.nazwa.trim()
      });
      newPattern.value.nazwa = '';
      newPattern.value.kodSvg = '';
      if (fileInput.value) fileInput.value.value = '';
      await fetchPatterns();
    } catch (error) {
      alert('Błąd podczas dodawania.');
    } finally {
      isLoading.value = false;
    }
  };
  
  const toggleStatus = async (wzor) => {
    try {
      await adminDictionaryAPI.updatePatternStatus(wzor.id, !wzor.isActive);
      wzor.isActive = !wzor.isActive;
    } catch (error) {
      alert('Nie udało się zmienić statusu.');
    }
  };
  
  const deletePattern = async (id) => {
    if (!confirm('Na pewno usunąć ten wzór?')) return;
    try {
      await adminDictionaryAPI.deletePattern(id);
      await fetchPatterns();
    } catch (error) {
      alert('Nie można usunąć wzoru (być może jest w użyciu). Spróbuj go po prostu Ukryć.');
    }
  };
  
  onMounted(fetchPatterns);
  </script>
  
  <style scoped>
  /* Przyciski */
  .glass-btn {
    background: rgba(242, 242, 242, 0.447);
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
  
  /* Miniatura */
  .pattern-thumbnail-wrapper {
    position: relative;
    width: 70px;
    height: 45px;
    background-color: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .pattern-thumbnail-wrapper:hover {
    border-color: #3b82f6;
  }
  .pattern-thumbnail {
    position: absolute;
    top: 30px;
    left: 29px;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    transform: scale(1.7);
  }
  
  .zoom-icon {
    position: absolute;
    bottom: 2px;
    right: 2px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 4px;
    padding: 2px;
    color: #4b5563;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .pattern-thumbnail-wrapper:hover .zoom-icon {
    opacity: 1;
  }
  
  /* Wzór w modalu */
  .preview-group {
    transform: translate(50%, 83%) scale(2);
    transform-origin: center;
  }
  
  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 1050;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .glass-modal-content {
    background: white;
    border-radius: 16px;
    width: 90%;
    max-width: 650px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
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