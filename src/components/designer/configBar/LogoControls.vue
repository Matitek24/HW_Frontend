<template>
  <div class="section-wrapper" :class="{ 'expanded-column': !compact }">

    <!-- ═══ COMPACT ═══ -->
    <div v-if="compact" class="group-section">
      <div class="group-header">Logo</div>

      <div class="d-flex align-items-center justify-content-center gap-2 mb-1" v-show="config.show !== false">
        <div class="form-check form-switch m-0">
          <input class="form-check-input" type="checkbox" role="switch" :checked="config.show !== false"
            @change="update('show', $event.target.checked)" />
        </div>
      </div>

      <div v-if="config.show === false" class="empty-state compact-empty" @click="update('show', true)">
        <div class="empty-state-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
        <span>Włącz logo</span>
      </div>

      <div v-else>
        <input type="file" ref="fileInput" class="d-none" accept=".png,.jpg,.jpeg,.svg" @change="handleFileUpload" />

        <div v-if="!config?.url" class="upload-zone compact-upload" @click="$refs.fileInput.click()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          <span class="upload-label">Wgraj</span>
        </div>

        <div v-else class="compact-uploaded">
          <button class="btn-x btn-x--label" style="width: 100%; justify-content: center; margin-bottom: 12px;"
            @click="removeLogo">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
            Usuń
          </button>

          <div class="field">
            <label>Skala: {{ Math.round((config.scale || 1) * 100) }}%</label>
            <input type="range" class="slider compact-slider" min="0.1" max="2" step="0.05" :value="config.scale || 1"
              @input="update('scale', parseFloat($event.target.value))" />
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ EXPANDED ═══ -->
    <template v-else>
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="column-title mb-0" style="border: none; padding: 0;">Logotyp</h3>
        <div class="form-check form-switch mb-0" v-show="true">
          <input class="form-check-input" type="checkbox" role="switch" :checked="config.show !== false"
            @change="update('show', $event.target.checked)">
        </div>
      </div>
      <div style="border-bottom: 1px solid #f3f4f6; margin-bottom: 16px; margin-top: -10px;"></div>

      <div v-if="config.show === false" class="empty-state expanded-empty" @click="update('show', true)">
        <div class="empty-state-icon large">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
        <div class="empty-state-text">
          <h4>Dodaj własne logo</h4>
          <p>Kliknij, aby włączyć haft na froncie czapki.</p>
        </div>
      </div>

      <div v-else>
        <input type="file" ref="fileInputExp" class="d-none" accept=".png,.jpg,.jpeg,.svg" @change="handleFileUpload" />

        <div v-if="!config?.url" class="upload-zone" @click="$refs.fileInputExp.click()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          <span class="upload-label">Wgraj plik</span>
          <small class="upload-hint">PNG, JPG, SVG · max 5MB</small>
        </div>

        <div v-else class="settings">
          <div class="status-row">

            <button class="btn-x btn-x--label" @click="removeLogo">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
              Usuń
            </button>
          </div>

          <div class="field">
            <label>Skala: {{ Math.round((config.scale || 1) * 100) }}%</label>
            <input type="range" class="slider compact-slider" min="0.1" max="2" step="0.05" :value="config.scale || 1"
              @input="update('scale', parseFloat($event.target.value))" />
          </div>

          <div class="field">
            <label>Pozycja X: {{ config.x ?? 0 }}</label>
            <input type="range" class="slider compact-slider" min="-400" max="400" step="5" :value="config.x ?? 0"
              @input="update('x', Number($event.target.value))" />
          </div>

          <div class="field">
            <label>Pozycja Y: {{ config.y ?? 0 }}</label>
            <input type="range" class="slider compact-slider" min="-105" max="120" step="5" :value="config.y ?? 0"
              @input="update('y', Number($event.target.value))" />
          </div>


        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import './styles/controls.css';

const props = defineProps({
  config: { type: Object, required: true },
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
  if (!MIME_OK.includes(file.type)) { alert('Dozwolone: PNG, JPG, SVG'); clear(); return; }
  if (file.size > MAX_SIZE) { alert('Max 5 MB!'); clear(); return; }

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
  if (fileInput.value) fileInput.value.value = '';
  if (fileInputExp.value) fileInputExp.value.value = '';
}

function handleLogoUploadRequest() {
  if (props.config.show) {
    if (props.compact && fileInput.value) fileInput.value.click();
    else if (!props.compact && fileInputExp.value) fileInputExp.value.click();
  }
}

onMounted(() => {
  window.addEventListener('request-logo-upload', handleLogoUploadRequest);
});

onUnmounted(() => {
  window.removeEventListener('request-logo-upload', handleLogoUploadRequest);
});
</script>

<style scoped>
.d-none {
  display: none;
}

.upload-zone {
  margin-top: 20px;
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

.upload-zone:hover {
  background: #f3f4f6;
  border-color: #6b7280;
  transform: translateY(-1px);
}

.compact-upload {
  padding: 8px 14px !important;
  min-width: 58px;
  border-width: 1.5px !important;
}

.upload-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.compact-upload .upload-label {
  font-size: 10px;
}

.upload-hint {
  font-size: 10px;
  color: #9ca3af;
}

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

.compact-name {
  font-size: 10px;
  font-weight: 600;
  color: #15803d;
  max-width: 50px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Pulsating dot ── */
.dot-alive {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #16a34a;
  flex-shrink: 0;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1
  }

  50% {
    opacity: .35
  }
}

/* ── X / remove button ── */
.btn-x {
  background: #fee2e2;
  color: #dc2626;
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all .2s;
  flex-shrink: 0;
}

.btn-x:hover {
  background: #dc2626;
  color: #fff;
}

.btn-x--label {
  width: 130px;
  border-radius: 8px;
  padding: 4px 10px;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
}

/* ── Expanded: settings ── */
.settings {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.badge-ok {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f0fdf4;
  color: #15803d;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid #bbf7d0;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.field {
  margin-bottom: 0;
}

.field label {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 4px;
  font-weight: 500;
}

.hint {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  background: #fffbeb;
  border-left: 2px solid #f59e0b;
  padding: 6px 8px;
  border-radius: 4px;
  color: #92400e;
}

.hint small {
  font-size: 10px;
  line-height: 1.4;
}

.hint svg {
  flex-shrink: 0;
  margin-top: 1px;
}

/* ── Empty State (UX) ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #f8fafc;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
}

.empty-state:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #3b82f6;
}

.empty-state-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.compact-empty {
  padding: 12px;
  min-width: 80px;
  height: 70px;
}

.compact-empty .empty-state-icon {
  width: 28px;
  height: 28px;
}

.compact-empty span {
  font-size: 10px;
  font-weight: 600;
}

.expanded-empty {
  padding: 24px 16px;
  margin-top: 8px;
  gap: 12px;
}

.expanded-empty .empty-state-icon.large {
  width: 44px;
  height: 44px;
}

.empty-state-text {
  text-align: center;
}

.empty-state-text h4 {
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #334155;
}

.empty-state-text p {
  font-size: 11px;
  margin: 0;
  color: #64748b;
}

/* ── Responsive ── */
@media (max-width: 600px) {
  .upload-zone {
    padding: 14px 10px;
  }

  .badge-ok {
    max-width: 100px;
    font-size: 10px;
  }

  .btn-x--label span {
    display: none;
  }
}
</style>