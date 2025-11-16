<template>
    <div class="login-page">
      <Login />
    </div>
  </template>
  
  <script setup>
  import Login from '../components/Login.vue';
  </script>
  
  <style scoped>
  .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  </style>