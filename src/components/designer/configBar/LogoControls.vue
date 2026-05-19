<template>
  <div class="section-wrapper" :class="{ 'expanded-column': !compact }">

    <!-- ═══ COMPACT ═══ -->
    <div v-if="compact" class="group-section">
      <div class="group-header">Logo</div>

      <input type="file" ref="fileInput" class="d-none"
        accept=".png,.jpg,.jpeg,.svg" @change="handleFileUpload" />

      <div v-if="!config?.url" class="upload-zone compact-upload" @click="$refs.fileInput.click()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
        </svg>
        <span class="upload-label">Wgraj</span>
      </div>

      <div v-else class="compact-uploaded">
        <button class="btn-x btn-x--label" style="width: 100%; justify-content: center; margin-bottom: 12px;" @click="removeLogo">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
          Usuń
        </button>

        <div class="field">
          <label>Skala: {{ Math.round((config.scale || 1) * 100) }}%</label>
          <input type="range" class="slider compact-slider"
            min="0.1" max="2" step="0.05"
            :value="config.scale || 1"
            @input="update('scale', parseFloat($event.target.value))" />
        </div>
      </div>
    </div>

    <!-- ═══ EXPANDED ═══ -->
    <template v-else>
      <h3 class="column-title">Logotyp</h3>

      <input type="file" ref="fileInputExp" class="d-none"
        accept=".png,.jpg,.jpeg,.svg" @change="handleFileUpload" />

      <div v-if="!config?.url" class="upload-zone" @click="$refs.fileInputExp.click()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
        </svg>
        <span class="upload-label">Wgraj plik</span>
        <small class="upload-hint">PNG, JPG, SVG · max 5MB</small>
      </div>

      <div v-else class="settings">
        <div class="status-row">
          
          <button class="btn-x btn-x--label" @click="removeLogo">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
            Usuń
          </button>
        </div>

        <div class="field">
          <label>Skala: {{ Math.round((config.scale || 1) * 100) }}%</label>
          <input type="range" class="slider compact-slider"
            min="0.1" max="2" step="0.05"
            :value="config.scale || 1"
            @input="update('scale', parseFloat($event.target.value))" />
        </div>

        <div class="field">
          <label>Pozycja X: {{ config.x ?? 0 }}</label>
          <input type="range" class="slider compact-slider"
            min="-400" max="400" step="5"
            :value="config.x ?? 0"
            @input="update('x', Number($event.target.value))" />
        </div>

        <div class="field">
          <label>Pozycja Y: {{ config.y ?? 0 }}</label>
          <input type="range" class="slider compact-slider"
            min="-105" max="120" step="5"
            :value="config.y ?? 0"
            @input="update('y', Number($event.target.value))" />
        </div>

    
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import './styles/controls.css';

const props = defineProps({
  config:  { type: Object, required: true },
  compact: { type: Boolean, default: false }
});

const emit = defineEmits(['update:config']);
const fileInput = ref(null);
const fileInputExp = ref(null);

const MAX_SIZE = 5 * 1024 * 1024;
const MIME_OK = ['image/png', 'image/jpeg', 'image/svg+xml'];

const shortName = computed(() => {
  const n = props.config?.originalName;
  if (!n) return '✓';
  return n.length > 8 ? n.slice(0, 6) + '…' : n;
});

function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (!MIME_OK.includes(file.type))  { alert('Dozwolone: PNG, JPG, SVG'); clear(); return; }
  if (file.size > MAX_SIZE)          { alert('Max 5 MB!');                 clear(); return; }

  revokeOld();
  emit('update:config', { ...props.config, url: URL.createObjectURL(file), rawFile: file, originalName: file.name });
}

function removeLogo() {
  revokeOld(); clear();
  emit('update:config', { ...props.config, url: null, rawFile: null, originalName: null });
}

function update(key, val) {
  emit('update:config', { ...props.config, [key]: val });
}

function revokeOld() {
  if (props.config?.url?.startsWith('blob:')) URL.revokeObjectURL(props.config.url);
}

function clear() {
  if (fileInput.value)    fileInput.value.value = '';
  if (fileInputExp.value) fileInputExp.value.value = '';
}
</script>

<style scoped>
.d-none { display: none; }
.upload-zone {
    margin-top:20px;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  background: #f9fafb;
  transition: all .2s;
  text-align: center;
}
.upload-zone:hover { background: #f3f4f6; border-color: #6b7280; transform: translateY(-1px); }

.compact-upload { padding: 8px 14px !important; min-width: 58px; border-width: 1.5px !important; }

.upload-label { font-size: 12px; font-weight: 600; color: #374151; }
.compact-upload .upload-label { font-size: 10px; }
.upload-hint  { font-size: 10px; color: #9ca3af; }

/* ── Compact uploaded state ── */
.compact-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background: #f0fdf4;
  padding: 4px 4px 4px 8px;
  border-radius: 10px;
  border: 1px solid #bbf7d0;
}
.compact-name { font-size: 10px; font-weight: 600; color: #15803d; max-width: 50px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ── Pulsating dot ── */
.dot-alive { width: 6px; height: 6px; border-radius: 50%; background: #16a34a; flex-shrink: 0; animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.35 } }

/* ── X / remove button ── */
.btn-x {
  background: #fee2e2; color: #dc2626; border: none;
  width: 20px; height: 20px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .2s; flex-shrink: 0;
}
.btn-x:hover { background: #dc2626; color: #fff; }

.btn-x--label {
  width: 130px; border-radius: 8px; padding: 4px 10px;
  gap: 4px; font-size: 11px; font-weight: 600;
}

/* ── Expanded: settings ── */
.settings { display: flex; flex-direction: column; gap: 8px; }

.status-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }

.badge-ok {
  display: inline-flex; align-items: center; gap: 6px;
  background: #f0fdf4; color: #15803d;
  font-size: 11px; font-weight: 600;
  padding: 4px 10px; border-radius: 8px; border: 1px solid #bbf7d0;
  max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.field { margin-bottom: 0; }
.field label {
  display: flex; justify-content: space-between;
  font-size: 11px; color: #6b7280; margin-bottom: 4px; font-weight: 500;
}

.hint {
  display: flex; align-items: flex-start; gap: 6px;
  background: #fffbeb; border-left: 2px solid #f59e0b;
  padding: 6px 8px; border-radius: 4px; color: #92400e;
}
.hint small { font-size: 10px; line-height: 1.4; }
.hint svg   { flex-shrink: 0; margin-top: 1px; }

/* ── Responsive ── */
@media (max-width: 600px) {
  .upload-zone { padding: 14px 10px; }
  .badge-ok    { max-width: 100px; font-size: 10px; }
  .btn-x--label span { display: none; }
}
</style>