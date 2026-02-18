<template>
  <div class="svg-wrapper d-flex align-items-end h-100" color-interpolation-filters="sRGB">
    <svg 
      :id="`hat-svg-${uniqueId}`"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink" 
      viewBox="0 0 1316.28 800.63"
      ref="svgRef">
      
      <defs>
        <clipPath :id="`clippath-new-${uniqueId}`">
          <path class="cls-2" d="M1314.34,192.86c-1.09-6.07-35.14-192-109.27-192s-107.21,178.47-109.62,191.4c-2.38-12.94-36.53-191.4-109.17-191.4s-108.25,183.92-109.71,191.88c-1.44-7.95-35.51-191.88-109.25-191.88s-107.52,180.05-109.65,191.57c-2.11-11.52-36.24-191.57-109.2-191.57s-108.63,185.92-109.73,192h-.04c-1.09-6.07-35.14-192-109.27-192s-108.63,185.92-109.73,192h-.06C218.53,186.79,184.48.87,110.35.87S1.72,186.79.61,192.86h-.03v546.9h1313.78V192.86h-.03Z"/>
        </clipPath>

        <clipPath :id="`prostokat-top-${uniqueId}`" transform="translate(0, -360)">
             <path d="M1314.34,192.86c-1.09-6.07-35.14-192-109.27-192s-107.21,178.47-109.62,191.4c-2.38-12.94-36.53-191.4-109.17-191.4s-108.25,183.92-109.71,191.88c-1.44-7.95-35.51-191.88-109.25-191.88s-107.52,180.05-109.65,191.57c-2.11-11.52-36.24-191.57-109.2-191.57s-108.63,185.92-109.73,192h-.04c-1.09-6.07-35.14-192-109.27-192s-108.63,185.92-109.73,192h-.06C218.53,186.79,184.48.87,110.35.87S1.72,186.79.61,192.86h-.03v546.9h1313.78V192.86h-.03Z"/>
        </clipPath>

        <clipPath :id="`prostokat2-${uniqueId}`" transform="translate(0, 93) rotate(180, 658, 370)">
          <rect class="cls-2" x="0" y="0" width="1316.4" height="740" />
        </clipPath>
        <clipPath :id="`prostokat3-${uniqueId}`" transform="translate(0, -66)">
          <rect class="cls-2" x="0" y="0" width="1316.4" height="740" />
        </clipPath>
      </defs>
     
      <g :style="{ clipPath: `url(#clippath-new-${uniqueId})` }">
  
        <rect :fill="config.base.bottom" class="cls-5" x="0.58" y="512.74" width="1313.78" height="227.89" />
        
        <rect :fill="config.base.top" class="cls-3" x="-0.12" y="-1.57" width="1316.4" height="286.07" />
        
        <rect :fill="config.base.middle" class="cls-1" x="-0.12" y="284.49" width="1316.4" height="228.85" />
        
        <g>
           <rect class="pasek" x="25.2" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="56.78" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="89.63" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="122.49" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="155.34" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="188.19" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="221.04" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="257.26" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="290.11" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="322.96" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="355.81" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="388.66" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="421.52" y="512.74" width="3.16" height="227.89"/>

           <rect class="pasek" x="453.95" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="486.8" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="519.65" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="552.5" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="585.35" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="618.2" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="654.42" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="687.27" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="720.12" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="752.98" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="785.83" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="818.68" y="512.74" width="3.16" height="227.89"/>

           <rect class="pasek" x="853" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="885.85" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="918.7" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="951.56" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="984.41" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="1017.26" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="1053.48" y="512.74" width="2" height="227.89"/>
           <rect class="pasek" x="1086.33" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="1119.18" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="1152.03" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="1184.88" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="1217.73" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="1251.85" y="512.74" width="3.16" height="227.89"/>
           <rect class="pasek" x="1286.6" y="512.74" width="3.16" height="227.89"/>
        </g>
      </g>
      <g :style="{ clipPath: `url(#prostokat-top-${uniqueId})` }">
        <g :style="{ clipPath: `url(#clippath-new-${uniqueId})` }" :fill="config.pattern.top">
          <g v-html="topPatternSvg" transform="translate(0, 50) scale(2.04)"></g>
        </g>
      </g>

      <g :style="{ clipPath: `url(#clippath-new-${uniqueId})` }">
        <g :fill="config.pattern.main" transform="translate(0, 283) scale(2.01)">
          <g v-html="mainPatternSvg"></g>
        </g>
      </g>
      
      <g :style="{ clipPath: `url(#prostokat3-${uniqueId})` }">
        <g :style="{ clipPath: `url(#prostokat2-${uniqueId})` }">
          <text 
            ref="textElement"
            :x="658.14" 
            :y="finalTextPosition"
            :fill="config.text.color" 
            :font-family="config.text.font" 
            :font-size="config.text.fontSize" 
            font-weight="bold"
            text-anchor="middle" 
            dominant-baseline="central"
            xml:space="preserve"
            style="white-space: pre; pointer-events: none;" 
        
          >
            {{ config.text.content }}
          </text>
        </g>
     </g>
    </svg>
  </div>
</template>
<script setup>
  import { computed, ref } from 'vue';
  const svgRef = ref(null);

  const props = defineProps({
    config: { type: Object, required: true },
    patternsDict: { type: Array, default: () => [] }
  });

  // --- TWOJA MAPA DOSTROJENIA (identyczna jak w Front) ---
  const FONT_TUNING = {
    'impact': { shift: 4, pivot: -0.01},
    'roboto': { shift: 4, pivot: 0.0},
    'arialbold': { shift: 6, pivot: -0.06},
    'arial': { shift: 2, pivot: 0.02},
    'tahoma': { shift: 5, pivot: -0.05},
    'default': { shift: 8, pivot: -0.05},
  };
  
  const uniqueId = Math.random().toString(36).substr(2, 9);
  
  const FLAT_BASE_Y = 395; 
  
  const finalTextPosition = computed(() => {
    const fontSize = props.config.text.fontSize || 64;
    const userOffset = -props.config.text.offsetY || 0;
    const fontName = (props.config.text.font || 'arial').toLowerCase();

    const tuning = FONT_TUNING[fontName] || FONT_TUNING['default'];


    return FLAT_BASE_Y + tuning.shift + (userOffset*0.85) + (fontSize * tuning.pivot);
  });
  
  // --- LOGIKA WZORÓW ---
  const topPatternSvg = computed(() => {
    const selectedId = props.config.patterns.top;
    if (!selectedId || selectedId === 'none') return null;
    const patternObj = props.patternsDict.find(p => p.id === selectedId);
    return patternObj ? patternObj.kodSvg : null;
  });
  
  const mainPatternSvg = computed(() => {
    const selectedId = props.config.patterns.bottom;
    if (!selectedId || selectedId === 'none') return null;
    const patternObj = props.patternsDict.find(p => p.id === selectedId);
    return patternObj ? patternObj.kodSvg : null;
  });

  defineExpose({ svgRef });
</script>
  
  <style scoped>

  .pasek {
    fill: var(--kolor-pasek, #000000); 
  }
  .cls-2 {
    fill: none;
  }
  .svg-wrapper svg {
  shape-rendering: crispEdges; 
}
  </style>