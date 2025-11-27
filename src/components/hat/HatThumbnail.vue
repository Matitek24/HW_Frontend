<template>
  <div class="thumbnail-svg">
    <svg viewBox="0 0 1144.47 664.47" xmlns="http://www.w3.org/2000/svg">
      
      <defs>
        <clipPath id="thumb-clip">
          <path d="M1144.45,171.3c-.95-4.95-30.61-156.45-95.19-156.45s-93.4,145.43-95.5,155.97c-2.07-10.54-31.82-155.97-95.1-155.97s-94.3,149.88-95.57,156.36c-1.25-6.48-30.94-156.36-95.17-156.36s-93.66,146.72-95.52,156.11c-1.84-9.39-31.57-156.11-95.12-156.11s-94.63,151.5-95.59,156.45h-.04c-.95-4.95-30.61-156.45-95.19-156.45s-94.63,151.5-95.59,156.45h-.05c-.95-4.95-30.61-156.45-95.19-156.45S.99,166.35.02,171.3h-.02v445.65h1144.47V171.3h-.02Z" />
        </clipPath>

        <pattern id="stripes-pattern" x="0" y="0" width="28" height="10" patternUnits="userSpaceOnUse">
           <rect x="0" y="0" width="3" height="232" class="pasek" /> 
        </pattern>
      </defs>

      <g clip-path="url(#thumb-clip)">
        
        <rect :fill="config.base.bottom" x="0" y="432" width="1144" height="232" />
        <rect fill="url(#stripes-pattern)" x="0" y="432" width="1144" height="232" style="opacity: 0.3" />
        
        <rect :fill="config.base.middle" x="0" y="206" width="1144" height="226" />
        
        <rect :fill="config.base.top" x="0" y="0" width="1144" height="206" />


        <g v-if="mainPatternSvg" :fill="config.pattern.main" transform="translate(-20, 203) scale(1.1)">
           <g v-html="mainPatternSvg"></g>
        </g>

        <g v-if="topPatternSvg" :fill="config.pattern.top" transform="translate(0, 50)">
           <g v-html="topPatternSvg"></g>
        </g>

        <text 
          v-if="config.text && config.text.content"
          x="572" 
          :y="finalTextPosition"
          :fill="config.text.color" 
          :font-family="config.text.font" 
          :font-size="config.text.fontSize" 
          font-weight="bold"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          {{ config.text.content }}
        </text>

      </g>

      <path 
        fill="none" 
        stroke="rgba(0,0,0,0.15)" 
        stroke-width="4" 
        d="M1144.45,171.3c-.95-4.95-30.61-156.45-95.19-156.45s-93.4,145.43-95.5,155.97c-2.07-10.54-31.82-155.97-95.1-155.97s-94.3,149.88-95.57,156.36c-1.25-6.48-30.94-156.36-95.17-156.36s-93.66,146.72-95.52,156.11c-1.84-9.39-31.57-156.11-95.12-156.11s-94.63,151.5-95.59,156.45h-.04c-.95-4.95-30.61-156.45-95.19-156.45s-94.63,151.5-95.59,156.45h-.05c-.95-4.95-30.61-156.45-95.19-156.45S.99,166.35.02,171.3h-.02v445.65h1144.47V171.3h-.02Z" 
      />

    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  config: { type: Object, required: true },
  patternsDict: { type: Array, default: () => [] }
});

const topPatternSvg = computed(() => {
  const selectedId = props.config.patterns?.top;
  if (!selectedId) return null;
  const pattern = props.patternsDict.find(p => p.id === selectedId);
  return pattern ? pattern.kodSvg : null;
});

const mainPatternSvg = computed(() => {
  const selectedId = props.config.patterns?.bottom;
  if (!selectedId) return null;
  const pattern = props.patternsDict.find(p => p.id === selectedId);
  return pattern ? pattern.kodSvg : null;
});

// --- LOGIKA POZYCJI TEKSTU ---
const finalTextPosition = computed(() => {
  const baseY = 335; 
  
  const offset = props.config.text?.offsetY || 0;

  return baseY + offset;
});
</script>

<style scoped>
.thumbnail-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}
.pasek {
  fill: #000000; 
}
</style>