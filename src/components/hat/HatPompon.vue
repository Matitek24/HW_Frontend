<template>
  <svg 
    id="pompon_svg" 
    data-name="Pompon" 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="233 0 904.77 259.81"
    :style="pomponStyles"
  >
    <g v-html="POMPON_SVG"></g>
  </svg>
</template>

<script setup>
import { computed } from 'vue';
import { POMPON_SVG } from '../../utils/pompon.js';

const props = defineProps({
  config: {
    type: Object,
    required: true
  }
});


const pomponStyles = computed(() => ({
  '--pompon-p1': props.config.pompons.p1,
  '--pompon-p2': props.config.pompons.p2,
  '--pompon-p3': props.config.pompons.p3,
  '--pompon-p4': props.config.pompons.p4
}));
</script>

<style scoped>
svg {
  width: 100%;
  height: auto;
}

svg :deep(.gls-1) {
  fill: var(--pompon-p1);
}

svg :deep(.gls-2) {
  fill: var(--pompon-p2);
}

svg :deep(.gls-3) {
  fill: var(--pompon-p3);
}

svg :deep(.gls-4) {
  fill: var(--pompon-p4);
}
</style>