<template>
    <div class="top-header">
      
      <div class="model-tag-container">
        <div class="tag-ribbon">
          <span class="tag-label">MODEL</span>
          <span class="tag-value">#M38 - H</span>
        </div>
      </div>
  
      <div class="actions-container">
        <div class="price-pill">
          <span class="currency">ZIMA</span>
          <span class="amount">25/26</span>
        </div>
        
        <button class="cart-btn">
          <span class="icon"><img src="../assets/Headwear_COLOR_CMYK_logo-1.png.webp" width="50px" alt="hw"></span>
        </button>
   
      </div>
  
    </div>
  </template>
  
  <script setup>
  // Tu w przyszłości możesz przyjmować propsy np. cenę
  </script>
  
  <style scoped>

  .top-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: 30px 34px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start; /* Ważne, żeby elementy "wisiały" od góry */
    z-index: 100;
    pointer-events: none; /* Dzięki temu klikniesz w czapkę pod spodem, jeśli tam jest */
  }
  
  /* Włączenie klikania dla dzieci kontenera */
  .top-header > * {
    pointer-events: auto;
  }
  
  /* --- STYLIZACJA METKI (LEWA) --- */
  .model-tag-container {
    /* Efekt cienia dający głębię */
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.08));
  }
  
  .tag-ribbon {
    background: #fff;
    /* Zaokrąglamy tylko dolne rogi, żeby wyglądało jak metka wychodząca z sufitu */
    border-radius: 0 0 12px 12px; 
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    border-top: 4px solid #569abf; 
  }
  
  .tag-label {
    font-size: 9px;
    color: #9ca3af; /* Szary, techniczny */
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  
  .tag-value {
    font-family: 'Courier New', monospace;
    font-size: 16px;
    font-weight: 700;
    color: #1f2937;
    letter-spacing: -0.5px;
  }
  
  .actions-container {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  
  .price-pill {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    padding: 8px 16px;
    border-radius: 50px;
    display: flex;
    align-items: baseline;
    gap: 4px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    font-family: 'Inter', sans-serif;
  }
  
  .currency {
    font-size: 12px;
    color: #6b7280;
    font-weight: 600;
  }
  
  .amount {
    font-size: 18px;
    font-weight: 800;
    color: #1f2937;
  }
  
  .cart-btn {
    background: rgba(255, 255, 255, 0.9); /* Ciemny kontrastowy przycisk */
    color: white;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transition: transform 0.2s;
  }
  
 
  
  /* Responsywność na małe telefony */
  @media (max-width: 400px) {
    .top-header {
      padding: 10px 15px;
    }
    .tag-value {
      font-size: 14px;
    }
    .amount {
      font-size: 16px;
    }
  }
  </style>