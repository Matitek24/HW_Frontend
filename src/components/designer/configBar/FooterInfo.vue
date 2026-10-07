<template>
  <div class="nano-footer-info">
    <span class="nano-content">
      {{ t('configurator.options.logo_info') }}
    </span>
  </div>
</template>

  <script setup>
import { useLanguage } from '../../../locales/useLanguage';

const {t} = useLanguage();
</script>
  <style scoped>
  .nano-footer-info {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #f8f9fa;
    font-size: 10px;
    color: #b1bdc4;
    text-align: center;
  }
  
  .nano-content {
    display: block;
  }
  </style>