<template>
    <div class="dashboard-page">
      <Czapka />
      <!-- <warptest /> -->
    </div>
  </template>
  
  <script setup>
  import Czapka from '../components/CzapkaComp.vue';
  import warptest from '../components/warptest.vue';
  </script>
  
  <style scoped>
  .dashboard-page {
    min-height: 100vh;
  }
  </style>