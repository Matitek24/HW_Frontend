<template>
    <div class="login-test-container">
      <h2>🔑 Test Logowania do Spring Boot API</h2>
      
      <label for="email">Email:</label>
      <input v-model="email" id="email" type="email" placeholder="Wpisz email">
      
      <label for="haslo">Hasło:</label>
      <input v-model="haslo" id="haslo" type="password" placeholder="Wpisz hasło">
      
      <button @click="handleLogin" :disabled="isLoading">
        {{ isLoading ? 'Logowanie...' : 'Zaloguj i Testuj' }}
      </button>
      
      <hr>
      
      <h3>Wynik:</h3>
      <pre class="log-output" :class="statusClass">{{ logMessage }}</pre>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import axios from 'axios';
  
  // --- ZMIENNE STANU ---
  const email = ref('test.user@frontend.pl'); // Użyj istniejącego e-maila
  const haslo = ref('BardzoTajneHaslo123'); // Użyj hasła w postaci czystego tekstu
  const logMessage = ref('Oczekiwanie na test...');
  const isLoading = ref(false);
  
  // Obliczana klasa CSS na podstawie komunikatu
  const statusClass = computed(() => {
    if (logMessage.value.includes('SUKCES')) return 'success';
    if (logMessage.value.includes('BŁĄD')) return 'error';
    return '';
  });
  
  // --- FUNKCJA LOGOWANIA ---
  async function handleLogin() {
    isLoading.value = true;
    logMessage.value = 'Wysyłanie żądania POST do /api/auth/login...';
  
    try {
      // Adres Twojego endpointu Spring Boot
      const API_URL = 'http://localhost:8080/api/auth/login'; 
      
      const response = await axios.post(API_URL, {
        email: email.value,
        haslo: haslo.value // Zgodne z LoginRequest DTO
      }, {
        // WAŻNE: Włączenie obsługi ciasteczek sesyjnych dla Spring Security
        withCredentials: true 
      });
  
      // W tym momencie Spring Security uwierzytelnił użytkownika i ustawił ciasteczko sesyjne (JSESSIONID)
      
      if (response.status === 200) {
        logMessage.value = `HURA! Logowanie SUKCES! Status: 200 OK. Odpowiedź: ${response.data}`;
        console.log("Logowanie powiodło się! Przeglądarka ma teraz ciasteczko sesyjne.");
        
        // Opcjonalnie: Po udanym logowaniu możesz spróbować wywołać chroniony endpoint
        testSecureEndpoint();
      }
      
    } catch (error) {
      if (error.response) {
        // Błąd HTTP (np. 401 Unauthorized, 403 Forbidden, 400 Bad Request)
        logMessage.value = `BŁĄD: ${error.response.status} - ${error.response.data || error.response.statusText}`;
        console.error('Błąd logowania:', error.response.data);
      } else if (error.request) {
        // Błąd CORS lub Sieci (serwer nie odpowiedział)
        logMessage.value = `BŁĄD SIECI/CORS: Serwer nie odpowiedział lub nastąpiła blokada. Sprawdź konsolę przeglądarki!`;
      } else {
        logMessage.value = `BŁĄD: Wystąpił błąd podczas konfiguracji żądania: ${error.message}`;
      }
    } finally {
      isLoading.value = false;
    }
  }
  
  // Opcjonalny test dla chronionego endpointu, jeśli go utworzyłeś
  async function testSecureEndpoint() {
      try {
          const SECURE_URL = 'http://localhost:8080/api/test/secure-data'; 
          const secureResponse = await axios.get(SECURE_URL, { withCredentials: true });
          
          logMessage.value += `\n\nTest chroniony SUKCES! Status: ${secureResponse.status}. Dane: ${secureResponse.data.message}`;
      } catch (e) {
          logMessage.value += `\n\nTest chroniony ZAWIOÓDŁ: ${e.response.status} ${e.response.data}`;
      }
  }
  
  </script>
  
  <style scoped>
  .login-test-container {
    max-width: 400px;
    margin: 20px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
  input, button {
    display: block;
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
  }
  button {
    background-color: #42b983;
    color: white;
    border: none;
    cursor: pointer;
  }
  .log-output {
    background-color: #f4f4f4;
    padding: 10px;
    border-radius: 4px;
    white-space: pre-wrap;
    word-wrap: break-word;
    border-left: 5px solid gray;
  }
  .success {
    border-left-color: #42b983;
    color: #1c5e3f;
  }
  .error {
    border-left-color: #e74c3c;
    color: #c0392b;
  }
  </style>