<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>

</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.czapka, .svg-wrapper {
  /* Wymusza renderowanie elementu na oddzielnej warstwie GPU */
  transform: translateZ(0); 
  will-change: transform;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

</style>