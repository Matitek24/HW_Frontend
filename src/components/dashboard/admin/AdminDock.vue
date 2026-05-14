<template>
  <div class="admin-dock-wrapper">
    <div class="admin-dock glass-dock">
      <router-link to="/dashboard" class="dock-item" active-class="active">
        <div class="icon-container">
          <i class="fa-solid fa-box-open"></i>
        </div>
        <span class="dock-label">Zamówienia</span>
      </router-link>

      <router-link to="/leads" class="dock-item" active-class="active">
        <div class="icon-container">
          <i class="fa-solid fa-users"></i>
        </div>
        <span class="dock-label">Leads</span>
      </router-link>

    </div>
  </div>
</template>

<script setup>
// AdminDock nie wymaga specjalnej logiki, router-link załatwia nawigację
</script>

<style scoped>
.admin-dock-wrapper {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  pointer-events: none; /* Pozwala klikać to, co jest poza dockiem */
}

.glass-dock {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  border-radius: 30px;
  padding: 10px 20px; /* Zmniejszony dock */
  display: flex;
  gap: 20px; /* Zmniejszony odstęp */
  pointer-events: auto; /* Włącza klikalność samego docka */
  transition: all 0.3s ease;
}

.dock-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #6b7280;
  padding: 8px 12px;
  border-radius: 16px;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Sprężysty efekt */
  min-width: 70px;
  position: relative;
}

.icon-container {
  font-size: 1.4rem; /* Zmniejszone ikony */
  margin-bottom: 6px;
  transition: transform 0.2s ease;
}

.dock-label {
  font-size: 0.8rem; /* Większy tekst */
  font-weight: 500;
  opacity: 0.8;
  transition: all 0.2s ease;
}

/* Hover effects */
.dock-item:hover {
  transform: translateY(-5px) scale(1.1);
  color: #1f2937;
  background: rgba(255, 255, 255, 0.5);
}

.dock-item:hover .dock-label {
  opacity: 1;
}

/* Active route styling */
.dock-item.active {
  color: #0ea5e9;
}

.dock-item.active .icon-container {
  transform: scale(1.1);
}

.dock-item.active::after {
  content: '';
  position: absolute;
  bottom: 2px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #0ea5e9;
}

/* Dodatkowy efekt lupy, jak w macOS - hover na jednym elemencie odsuwa inne lekko (opcjonalnie) */
.glass-dock:hover .dock-item:not(:hover) {
  transform: scale(0.95);
  opacity: 0.7;
}
</style>
