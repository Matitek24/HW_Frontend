<template>
    <div id="print-area">
      <div class="print-bg"></div>
  
      <div class="print-container">
          
          <header class="print-header">
             <div class="header-left">
                <h1>KARTA PRODUKTOWA</h1>
                <div class="meta-data">
                  <div class="meta-item main-item">
                    <span class="label">MODEL:</span>
                    <span class="value">M38-H</span>
                  </div>
                  <div class="meta-item">
                    <span class="label">DATA:</span>
                    <span class="value">{{ new Date().toLocaleDateString('pl-PL') }}</span>
                  </div>
                </div>
             </div>
             
             <div class="header-right">
               <img 
                 :src="config.customLogo || defaultLogo" 
                 class="print-logo" 
                 alt="Logo"
               />
             </div>
          </header>
      
          <hr class="divider" />
      
          <main class="print-content">
              <div class="hat-col">
                  <div class="view-header">WIDOK PŁASKI</div>
                  <div class="hat-wrapper flat-wrapper">
                      <HatFlat :config="config" :patternsDict="patternsDict" /> 
                  </div>
              </div>
      
              <div class="hat-col">
                  <div class="view-header">WIDOK PRZÓD</div>
                  <div class="hat-wrapper front-wrapper">
                      <HatFront 
                        :config="config" 
                        :show-pompon="config.pompons.show" 
                        :patternsDict="patternsDict" 
                      />
                  </div>
              </div>
          </main>
      
          <footer class="print-footer">
              <div class="footer-content">
                  <div class="footer-line"></div>
                  <p>Wygenerowano automatycznie przez system Headwear Professionals</p>
              </div>
          </footer>
      </div>
    </div>
  </template>
  
  <script setup>
  import HatFlat from './hat/HatFlat.vue';
  import HatFront from './hat/HatFront.vue';
  
  import defaultLogo from '../assets/Headwear_COLOR_CMYK_logo-1.png.webp';
  
  const props = defineProps({
    config: {
      type: Object,
      required: true
    },
    patternsDict: {
      type: Array,
      default: () => []
    }
  });
  </script>
  
  <style>
  /* 1. UKRYWANIE NA EKRANIE */
  #print-area {
    display: none;
  }
  @media print {
    @page {
      size: A4; 
      margin: 10mm; /* Mały margines systemowy, resztę robimy CSSem */
    }
  
    html, body {
      margin: 0;
      padding: 0;
      background: white !important;
    }
  
    body * {
  visibility: hidden;
}

.svg-wrapper * {
  visibility: visible;
}
  
    /* 2. GŁÓWNY OBSZAR DRUKU */
    #print-area {
      display: block; 
      position: absolute; /* Wracamy do absolute, bo fixed footer załatwia sprawę */
      left: 0;
      top: 0;
      width: 100%; 
      min-height: 100%;
      background: white !important;
      z-index: 9999;
      visibility: visible;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      color: #111;
      
      /* KLUCZOWE: Dodajemy padding na dole strony równy wysokości stopki */
      /* Żeby treść nie wjechała pod przyklejoną stopkę */
      padding-bottom: 50px; 
      box-sizing: border-box;
    }
    
    #print-area * {
      visibility: visible;
    }
  
    /* --- NAGŁÓWEK --- */
    .print-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 10px;
    }
  
    .header-left h1 {
      font-size: 24px;
      font-weight: 900;
      margin: 0 0 15px 0;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #000;
    }
  
    .meta-data {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
  
    .meta-item {
      font-size: 14px;
      color: #333;
    }
  
    .meta-item.main-item {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 5px;
    }
  
    .label {
        font-weight: 700;
        display: inline-block;
        width: 70px;
        color: #555;
    }
  
    .print-logo {
      width: 200px;
      height: 200px;
      object-fit: contain;
      object-position: right top;
      margin-top: -10px;
    }
  
    .divider {
      border: 0;
      border-bottom: 3px solid #000;
      margin-bottom: 30px;
      width: 100%;
    }
  
    /* --- TREŚĆ --- */
    .print-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      align-items: flex-start;
    }
  
    .hat-col {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  
    .view-header {
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 20px;
      border-bottom: 1px solid #ccc;
      width: 80%;
      text-align: center;
      padding-bottom: 5px;
    }
  

  
    /* --- SKALOWANIE --- */
    .hat-wrapper {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }
  
  
    /* --- STOPKA - TO JEST TA ZMIANA --- */
    .print-footer {
      position: fixed; /* To sprawia, że jest na KAŻDEJ stronie */
      bottom: 0;
      left: 0;
      width: 100%;
      background: white; /* Ważne: białe tło żeby przykryć ewentualne śmieci pod spodem */
      z-index: 999999;   /* Najwyższy priorytet widoczności */
      padding-bottom: 10mm; /* Odsunięcie od krawędzi kartki */
    }
  
    .footer-content {
        text-align: center;
        width: 100%;
    }
  
    .footer-line {
        border-top: 1px solid #ddd;
        margin-bottom: 5px;
        width: 100%;
    }
  
    .print-footer p {
      font-size: 10px;
      color: #888;
      text-transform: uppercase;
      margin: 0;
      text-align: center;
    }
  }

  </style>