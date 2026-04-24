<template>
  <tr class="detail-row">
    <td colspan="7" class="p-0 border-0">
      <div class="detail-container p-4">
        <div class="row g-4">
          
          <!-- Baza Czapki -->
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

          <!-- Dodatki -->
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

          <!-- Napis -->
          <div class="col-md-3">
            <h6 class="detail-header">TWÓJ NAPIS / TEKST</h6>
            <div class="mt-3 p-3 bg-light rounded-3 text-center border border-light">
              <span 
                class="d-block mb-2 text-preview" 
                :style="{ 
                  color: project.config.text.color, 
                  fontFamily: project.config.text.font
                }">
                {{ project.config.text.content }}
              </span>
              <small class="text-muted d-block font-monospace">{{ project.config.text.color }}</small>
            </div>
          </div>

          <!-- Uwagi Klienta -->
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

<script setup>
defineProps({
  project: {
    type: Object,
    required: true
  },
  getPatternName: {
    type: Function,
    required: true
  }
});
</script>

<style scoped>
.detail-row td {
  border: none !important;
}
.detail-container {
  background: white;
  border-radius: 0 0 16px 16px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
  border-top: 1px solid rgba(0,0,0,0.02);
  border: 1px solid rgba(0, 0, 0, 0.05); /* Lekkia ramka ze wszystkich stron w expanded state */
}

.detail-header {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #9ca3af;
  font-weight: 700;
  margin-bottom: 0;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 8px;
}

.color-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
  color: #4b5563;
}

.color-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.color-dot-sm {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid rgba(0,0,0,0.1);
}

.text-sm {
  font-size: 0.85rem;
}

.text-preview {
  font-size: 24px;
  font-weight: bold;
}
</style>
