<template>
    <div class="dashboard-wrapper">
      <div class="blobs-container">
        <div class="bg-blob blob-1"></div>
        <div class="bg-blob blob-2"></div>
      </div>
  
      <div class="container-fluid px-4 px-lg-5 px-xxl-6 position-relative z-1">
        
        <header class="d-flex justify-content-between align-items-center py-5 mb-3">
          <div>
            <h1 class="display-6 fw-bold text-dark mb-0" style="letter-spacing: -1px;">CMS</h1>
            <p class="text-muted fw-light mt-1">Zarządzanie zasobami konfiguratora</p>
          </div>
          <!-- Zakładki nawigacyjne -->
          <div class="d-flex gap-2 p-1 glass-tabs rounded-pill">
            <button 
              @click="activeTab = 'colors'" 
              class="tab-btn" 
              :class="{ active: activeTab === 'colors' }">
              Kolory
            </button>
            <button 
              @click="activeTab = 'patterns'" 
              class="tab-btn" 
              :class="{ active: activeTab === 'patterns' }">
              Wzory (SVG)
            </button>
            <button 
              @click="activeTab = 'fonts'" 
              class="tab-btn" 
              :class="{ active: activeTab === 'fonts' }">
              Czcionki
            </button>
          </div>
        </header>
  
        <!-- Fragment CmsDashboard.vue -->
            <div class="glass-panel p-4 p-lg-5" style="padding-bottom: 150px !important;">
            <router-view v-slot="{ Component }">
                <KeepAlive>
                <component :is="activeTab === 'colors' ? DictColors : (activeTab === 'patterns' ? DictPatterns : null)" />
                </KeepAlive>
            </router-view>
            </div>
      </div>
  
      <!-- Pasek nawigacyjny dolny -->
      <AdminDock />
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import AdminDock from '../components/dashboard/admin/AdminDock.vue';
  import DictColors from '../components/dashboard/cms/DictColors.vue';
  import DictPatterns from '../components/dashboard/cms/DictPatterns.vue';
  
  const activeTab = ref('colors');
  </script>
  
  <style scoped>
  /* Skopiuj tu style tła .dashboard-wrapper i .glass-panel ze swojego Dashboard.vue */
  
  .glass-tabs {
    background: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(10px);
  }
  
  .tab-btn {
    background: transparent;
    border: none;
    padding: 8px 24px;
    border-radius: 99px;
    font-weight: 500;
    color: #4b5563;
    transition: all 0.3s ease;
  }
  
  .tab-btn.active {
    background: #1f2937;
    color: white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  </style>