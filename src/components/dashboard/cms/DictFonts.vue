<template>
    <div>
        <!-- Formularz dodawania -->
        <div class="row mb-4 g-3 align-items-end bg-light p-4 rounded-4 shadow-sm border border-white">
            <div class="col-md-4">
                <label class="field-label">Nazwa czcionki</label>
                <input type="text" v-model.trim="form.nazwa" class="form-control field-input"
                    placeholder="np. Montserrat" @keyup.enter="upload" />
            </div>
            <div class="col-md-5">
                <label class="field-label">Plik (.ttf / .otf)</label>
                <div class="d-flex align-items-center gap-3">
                    <button class="file-btn" @click="fileInput.click()">{{ form.file ? form.file.name : 'Wybierz plik…'
                        }}</button>
                    <input ref="fileInput" type="file" accept=".ttf,.otf" class="d-none" @change="onFile" />
                    <div class="form-check mb-0">
                        <input id="bold" type="checkbox" class="form-check-input" v-model="form.bold" />
                        <label for="bold" class="form-check-label small text-muted">Pogrubiona</label>
                    </div>
                </div>
            </div>
            <div class="col-md-3 d-flex justify-content-end">
                <button class="tab-btn active" :disabled="!canUpload || uploading" @click="upload">
                    {{ uploading ? 'Wgrywanie…' : '+ Dodaj czcionkę' }}
                </button>
            </div>
            <p v-if="error" class="col-12 text-danger small mb-0">{{ error }}</p>
        </div>

        <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary"></div>
        </div>

        <!-- Tabela -->
        <div v-else class="table-responsive px-1">
            <table class="table table-hover align-middle mb-0 spaced-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>PODGLĄD</th>
                        <th>NAZWA</th>
                        <th>TYP</th>
                        <th>PŁASKI <span class="th-sub">shift / pivot</span></th>
                        <th>FRONT <span class="th-sub">shift / pivot</span></th>
                        <th class="text-end">AKCJE</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="f in paginatedFonts" :key="f.id">
                        <tr :class="{ 'row-open': openId === f.id }">
                            <td class="text-muted">#{{ f.id }}</td>
                            <td class="sample"
                                :style="{ fontFamily: `${f.family}, sans-serif`, fontWeight: f.bold ? 'bold' : 'normal' }">
                                Konfigurator</td>
                            <td class="fw-medium">{{ f.name }}<span v-if="f.bold" class="tag ms-2">Bold</span></td>
                            <td><span class="tag">{{ f.fileUrl ? 'Wgrana' : 'Systemowa' }}</span></td>
                            <td class="text-muted">{{ f.flat.shift }} / {{ f.flat.pivot }}</td>
                            <td class="text-muted">{{ f.front.shift }} / {{ f.front.pivot }}</td>
                            <td class="text-end">
                                <div class="d-flex justify-content-end gap-2">
                                    <button class="glass-btn glass-btn-sm" @click="toggle(f)">
                                        {{ openId === f.id ? 'Zwiń' : 'Kalibruj' }}
                                    </button>
                                    <button v-if="f.id" class="glass-btn glass-btn-sm text-danger" style="border-color: #fca5a5; background: #fef2f2;" @click="removeFont(f)">
                                        Usuń
                                    </button>
                                </div>
                            </td>
                        </tr>

                        <!-- Kalibracja -->
                        <tr v-if="openId === f.id" class="calib-row">
                            <td colspan="7" class="calib-cell">
                                <div class="calib-card">
                                    <div class="d-flex flex-wrap gap-4 align-items-center mb-3">
                                        <input type="text" v-model="sample" class="form-control field-input"
                                            style="width: 280px" placeholder="Tekst testowy" />
                                        <div class="d-flex align-items-center gap-3">
                                            <span class="field-label mb-0">Rozmiar: {{ Math.round(size) }}</span>
                                            <input type="range" min="30" max="120" v-model.number="size"
                                                :disabled="playing" class="slider" style="width: 200px" />
                                            <button class="glass-btn glass-btn-sm" @click="playing = !playing">{{
                                                playing ? 'Stop' : 'Testuj' }}</button>
                                        </div>
                                    </div>
                                    <p class="legend mb-4">
                                        <span class="dot" style="background:#cbd5e1"></span>krawędzie pasa
                                        <span class="dot" style="background:red"></span>środek pasa (tu ma leżeć środek
                                        liter)
                                        <span class="dot" style="background:#3b82f6"></span>obrys napisu
                                    </p>

                                    <div class="calib-grid">
                                        <!-- PŁASKI -->
                                        <div>
                                            <div class="group-title">Widok płaski</div>
                                            <svg class="preview" viewBox="0 280 1316 240">
                                                <rect x="0" :y="BAND.top" width="1316" :height="BAND.bottom - BAND.top"
                                                    fill="#f8fafc" />
                                                <line x1="0" x2="1316" :y1="BAND.top" :y2="BAND.top" stroke="#cbd5e1"
                                                    stroke-width="3" />
                                                <line x1="0" x2="1316" :y1="BAND.bottom" :y2="BAND.bottom"
                                                    stroke="#cbd5e1" stroke-width="3" />
                                                <line x1="0" x2="1316" :y1="FLAT_BASE_Y" :y2="FLAT_BASE_Y" stroke="red"
                                                    stroke-width="2.5" stroke-dasharray="12 8" />
                                                <text :ref="setFlatEl" :x="FLAT_CENTER_X" :y="flatY"
                                                    text-anchor="middle" dominant-baseline="central" :font-size="size"
                                                    :font-family="`${f.family}, sans-serif`"
                                                    :font-weight="f.bold ? 'bold' : 'normal'" fill="#2c3e50"
                                                    xml:space="preserve" style="white-space: pre">{{ sample }}</text>
                                                <rect v-if="flatBox" v-bind="flatBox" fill="none" stroke="#3b82f6"
                                                    stroke-width="3" stroke-dasharray="8 5" />
                                            </svg>
                                            <div v-for="s in flatFields" :key="s.k"
                                                class="d-flex align-items-center gap-3 mb-2">
                                                <label class="field-lbl">{{ s.label }}</label>
                                                <input type="range" class="slider flex-grow-1" :min="s.min" :max="s.max"
                                                    :step="s.step" v-model.number="draft[s.k]" />
                                                <input type="number" class="form-control form-control-sm num"
                                                    :step="s.step" v-model.number="draft[s.k]" />
                                            </div>
                                        </div>

                                        <!-- FRONT -->
                                        <div>
                                            <div class="group-title">Widok frontalny</div>
                                            <svg class="preview" viewBox="15 175 565.42 225">
                                                <defs>
                                                    <path id="fp-curve" d="M -55 263 Q 297 300 650 263" />
                                                </defs>
                                                <path :d="FRONT_EDGE_TOP" fill="none" stroke="#cbd5e1"
                                                    stroke-width="2" />
                                                <path :d="FRONT_EDGE_BOTTOM" fill="none" stroke="#cbd5e1"
                                                    stroke-width="2" />
                                                <path :d="FRONT_CENTER" fill="none" stroke="red" stroke-width="1.5"
                                                    stroke-dasharray="7 5" />
                                                <text :ref="setFrontEl" :dy="front.dy" text-anchor="middle"
                                                    letter-spacing="2" :font-size="front.fontSize"
                                                    :font-family="`${f.family}, sans-serif`"
                                                    :font-weight="f.bold ? 'bold' : 'normal'" fill="#2c3e50"
                                                    xml:space="preserve" style="white-space: pre">
                                                    <textPath href="#fp-curve" startOffset="50%" method="align"
                                                        spacing="auto">{{ sample }}</textPath>
                                                </text>
                                                <rect v-if="frontBox" v-bind="frontBox" fill="none" stroke="#3b82f6"
                                                    stroke-width="1.5" stroke-dasharray="5 3" />
                                            </svg>
                                            <div v-for="s in frontFields" :key="s.k"
                                                class="d-flex align-items-center gap-3 mb-2">
                                                <label class="field-lbl">{{ s.label }}</label>
                                                <input type="range" class="slider flex-grow-1" :min="s.min" :max="s.max"
                                                    :step="s.step" v-model.number="draft[s.k]" />
                                                <input type="number" class="form-control form-control-sm num"
                                                    :step="s.step" v-model.number="draft[s.k]" />
                                            </div>
                                        </div>
                                    </div>

                                    <div class="d-flex align-items-center gap-3 mt-4">
                                        <button class="tab-btn active" :disabled="saving" @click="save(f)">{{ saving ?
                                            'Zapisywanie…' : 'Zapisz kalibrację' }}</button>
                                        <span v-if="saved" class="text-success small">Zapisano ✓</span>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </template>

                    <tr v-if="!fonts.length">
                        <td colspan="7" class="text-center text-muted py-5">Brak czcionek w bazie.</td>
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
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { adminDictionaryAPI } from '../../../utils/axios';
import { useFontsStore } from '../../../utils/fonts/fontsStore';
import { loadFont } from '../../../utils/fonts/fontService';
import { flatTextY, frontTextProps, FLAT_BASE_Y, FLAT_CENTER_X } from '../../../utils/fonts/textPosition';

// Pas, w którym ma się zmieścić napis (krawędzie z HatFlat: 284.5 → 513.3).
// Jeśli napis ma mieścić się między wzorami, zmień te dwie liczby.
const BAND = { top: 284.5, bottom: 513.3 };

// Krawędzie środkowego pasa z HatFront oraz linia dokładnie pośrodku między nimi
const FRONT_EDGE_TOP = 'M845.53,165.1c-353.01,61.25-713.92,61.31-1066.94.17';
const FRONT_EDGE_BOTTOM = 'M874.91,334.43c-372.43,64.62-753.2,64.68-1125.65.18';
const FRONT_CENTER = 'M860.22,249.77c-362.72,62.94-733.56,63-1096.3.18';

const flatFields = [
    { k: 'flatShift', label: 'Shift', min: -30, max: 30, step: 0.5 },
    { k: 'flatPivot', label: 'Pivot', min: -0.5, max: 0.5, step: 0.01 },
];
const frontFields = [
    { k: 'frontShift', label: 'Shift', min: -30, max: 30, step: 0.5 },
    { k: 'frontPivot', label: 'Pivot', min: -0.5, max: 0.5, step: 0.01 },
];

const store = useFontsStore();
const fonts = computed(() => store.list);
const isLoading = ref(false);
const preload = () => fonts.value.forEach((f) => loadFont(f).catch(() => { }));

// --- PAGINACJA ---
const currentPage = ref(1);
const itemsPerPage = 10;

const totalPages = computed(() => Math.ceil(fonts.value.length / itemsPerPage));

const paginatedFonts = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return fonts.value.slice(start, start + itemsPerPage);
});

watch(totalPages, (newTotal) => {
    if (currentPage.value > newTotal && newTotal > 0) {
        currentPage.value = newTotal;
    }
});

onMounted(async () => {
    isLoading.value = true;
    await store.fetchFonts(true);
    isLoading.value = false;
    preload();
});

// ---------- UPLOAD ----------
const fileInput = ref(null);
const form = reactive({ nazwa: '', bold: false, file: null });
const uploading = ref(false);
const error = ref('');
const canUpload = computed(() => form.nazwa && form.file);

const onFile = (e) => {
    form.file = e.target.files[0] || null;
    if (form.file && !form.nazwa) form.nazwa = form.file.name.replace(/\.(ttf|otf)$/i, '');
};

// ---------- USUWANIE ----------
const upload = async () => {
    if (!canUpload.value || uploading.value) return;
    error.value = '';
    uploading.value = true;
    try {
        const fd = new FormData();
        fd.append('nazwa', form.nazwa);
        fd.append('bold', form.bold);
        fd.append('file', form.file);
        await adminDictionaryAPI.uploadFont(fd);
        await store.fetchFonts(true);
        preload();
        Object.assign(form, { nazwa: '', bold: false, file: null });
        fileInput.value.value = null;
    } catch (e) {
        error.value = e?.response?.status === 400
            ? 'Nieprawidłowy plik (tylko .ttf / .otf, maks. 5 MB).'
            : (e?.message || 'Nie udało się wgrać czcionki.');
    } finally {
        uploading.value = false;
    }
};

// ---------- KALIBRACJA ----------
const openId = ref(null);
const draft = reactive({ flatShift: 0, flatPivot: 0, frontShift: 0, frontPivot: 0 });
const size = ref(64);
const sample = ref('ĄĆĘŁŃÓŚŹŻ M38-H');
const saving = ref(false);
const saved = ref(false);
const playing = ref(false);

// Te same wzory co w HatFlat / HatFront, tylko na wartościach roboczych
const flatY = computed(() => flatTextY({ flat: { shift: draft.flatShift, pivot: draft.flatPivot } }, size.value, 0));
const front = computed(() => frontTextProps({ front: { shift: draft.frontShift, pivot: draft.frontPivot } }, size.value, 0));

// Obrys napisu mierzony z prawdziwego <text> (getBBox)
let flatEl = null, frontEl = null;
const setFlatEl = (el) => { flatEl = el; };
const setFrontEl = (el) => { frontEl = el; };
const flatBox = ref(null);
const frontBox = ref(null);

const bbox = (el) => {
    if (!el) return null;
    try { const { x, y, width, height } = el.getBBox(); return { x, y, width, height }; } catch { return null; }
};
const measure = () => { flatBox.value = bbox(flatEl); frontBox.value = bbox(frontEl); };

watch(
    () => [size.value, sample.value, openId.value, draft.flatShift, draft.flatPivot, draft.frontShift, draft.frontPivot],
    measure,
    { flush: 'post' }
);

const toggle = async (f) => {
    playing.value = false;
    if (openId.value === f.id) { openId.value = null; return; }
    openId.value = f.id;
    saved.value = false;
    Object.assign(draft, {
        flatShift: f.flat.shift, flatPivot: f.flat.pivot,
        frontShift: f.front.shift, frontPivot: f.front.pivot,
    });
    await loadFont(f).catch(() => { });
    await nextTick();
    measure();
};

const save = async (f) => {
    saving.value = true;
    saved.value = false;
    try {
        await adminDictionaryAPI.calibrateFont(f.id, { ...draft });
        await store.fetchFonts(true);
        saved.value = true;
    } catch (e) {
        error.value = e?.message || 'Nie udało się zapisać kalibracji.';
    } finally {
        saving.value = false;
    }
};

// "Testuj": rozmiar faluje 40 ↔ 100
let raf = 0;
const tick = (t) => {
    if (!playing.value) return;
    size.value = 70 + 30 * Math.sin(t / 700);
    raf = requestAnimationFrame(tick);
};
watch(playing, (p) => { if (p) raf = requestAnimationFrame(tick); else cancelAnimationFrame(raf); });
const removeFont = async (f) => {
    if (!f.id) return; // Zabezpieczenie przed usuwaniem fontów systemowych
    
    if (!confirm(`Czy na pewno chcesz trwale usunąć czcionkę "${f.name}"? Tej operacji nie można cofnąć.`)) {
        return;
    }

    try {
        await adminDictionaryAPI.deleteFont(f.id);
        
        if (openId.value === f.id) openId.value = null; 
        
        await store.fetchFonts(true);
    } catch (e) {
        alert(e?.message || 'Nie udało się usunąć czcionki.');
    }
};
onUnmounted(() => cancelAnimationFrame(raf));
</script>

<style scoped>
/* formularz */
.field-label {
    display: block;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
    color: #374151;
    margin-bottom: 6px;
}

.field-input {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 8px 12px;
}

.file-btn {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 0.95rem;
    color: #374151;
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.file-btn:hover {
    border-color: #9ca3af;
}

/* przyciski jak w DictColors */
.glass-btn {
    background: rgba(242, 242, 242, 0.459);
    border: 1px solid rgba(0, 0, 0, 0.08);
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

.glass-btn-sm {
    padding: 5px 16px;
    font-size: 0.82rem;
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

/* tabela jak w DictPatterns: tylko poziome linie, dużo przestrzeni */
.spaced-table {
    --bs-table-bg: transparent;
}

.spaced-table thead th {
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: .04em;
    color: #1f2937;
    padding: 1.1rem 0.9rem;
    border-bottom: 1px solid #e5e7eb;
}

.spaced-table tbody td {
    padding: 1.2rem 0.9rem;
    border-bottom: 1px solid #eceff3;
}

.th-sub {
    font-weight: 400;
    color: #9ca3af;
    letter-spacing: 0;
    text-transform: none;
    font-size: 0.75rem;
    margin-left: 4px;
}

.row-open>td {
    background-color: rgba(31, 41, 55, 0.03) !important;
}

.sample {
    font-size: 18px;
    white-space: nowrap;
}

.tag {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
    padding: 3px 10px;
    border: 1px solid #d9dde3;
    border-radius: 6px;
    background: #fff;
    color: #1f2937;
}

/* kalibracja: biała karta wewnątrz komórki, bez tła wiersza i bez podświetlenia hover */
.calib-row>td {
    padding: 0.5rem 0.9rem 1.5rem !important;
    background: transparent !important;
    --bs-table-bg-state: transparent;
    --bs-table-bg-type: transparent;
    box-shadow: none;
}

.calib-row:hover>td {
    --bs-table-bg-state: transparent;
}

.calib-card {
    background: #fff;
    border: 1px solid #eceff3;
    border-radius: 16px;
    padding: 1.5rem;
}

.calib-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
}

@media (max-width: 1199px) {
    .calib-grid {
        grid-template-columns: 1fr;
    }
}

.group-title {
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: .06em;
    color: #9ca3af;
    text-transform: uppercase;
    margin-bottom: 12px;
}

.preview {
    display: block;
    width: 100%;
    height: auto;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    margin-bottom: 14px;
}

.field-lbl {
    width: 50px;
    font-size: 0.78rem;
    font-weight: 700;
    color: #6b7280;
    margin: 0;
}

.num {
    width: 84px;
}

.slider {
    accent-color: #1f2937;
}

.legend {
    font-size: 0.8rem;
    color: #6b7280;
    display: flex;
    flex-wrap: wrap;
    gap: 6px 22px;
    align-items: center;
}

.dot {
    display: inline-block;
    width: 18px;
    height: 3px;
    border-radius: 2px;
    margin-right: 8px;
    vertical-align: middle;
}
</style>