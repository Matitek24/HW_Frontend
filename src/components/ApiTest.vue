<template>
    <div class="login-test-container">
        <button @click="testPublicApi">Test Publicznego API /api/public/roles</button>
        <p>Publiczny wynik: <strong>{{ publicData }}</strong></p>
    </div>
  </template>
  
  <script setup>
 import { ref } from 'vue'; // <--- MUSISZ ZAIMPORTOWAĆ 'ref'
 import axios from 'axios';



const publicData = ref('Czekam na dane publiczne...');

async function testPublicApi() {
  publicData.value = 'Wysyłanie żądania do /api/public/roles...';
  
  try {
    const PUBLIC_URL = 'http://localhost:8080/api/public/roles';
    
    // Żądanie GET do publicznego endpointu. Nie wymaga withCredentials.
    const response = await axios.get(PUBLIC_URL);

    if (response.status === 200) {
      publicData.value = `Połączenie SUKCES! Odebrano JSON: ${JSON.stringify(response.data)}`;
      console.log("Publiczne API działa, dane:", response.data);
    }
  } catch (error) {
    if (error.response) {
      publicData.value = `BŁĄD: ${error.response.status} - Sprawdź konfigurację API!`;
    } else {
      publicData.value = `BŁĄD SIECI/CORS: Żądanie zostało zablokowane.`;
    }
    console.error('Błąd testu publicznego API:', error);
  }
}
// ...
  
  </script>
  
  <style scoped>
  
  </style>