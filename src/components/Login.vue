<template>
    <div class="card shadow-lg mx-auto" style="max-width: 420px;">
      <div class="card-body p-4">
        <h2 class="card-title text-center text-primary mb-4">Logowanie JWT</h2>
        
        <!-- Formularz logowania -->
        <form @submit.prevent="handleLogin">
          
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" id="email" v-model="email" required 
                   class="form-control" placeholder="Wprowadź email">
          </div>
  
          <div class="mb-4">
            <label for="haslo" class="form-label">Hasło</label>
            <input type="password" id="haslo" v-model="haslo" required 
                   class="form-control" placeholder="Wprowadź hasło">
          </div>
  
          <button type="submit" :disabled="isLoading" 
                  class="btn btn-primary w-100 py-2">
            <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            {{ isLoading ? 'Logowanie...' : 'Zaloguj się' }}
          </button>
        </form>
  
        <!-- Sekcja Komunikatów -->
        <div v-if="token" class="mt-4 alert alert-success text-break">
          <h6 class="alert-heading">Sukces! Uwierzytelniono.</h6>
          <p class="mb-1">Otrzymany token ({{ tokenType }}):</p>
          <div class="token-output border p-2 bg-light rounded mb-2 overflow-auto" style="font-size: 0.8rem;">
              {{ token }}
          </div>
          <button @click="copyToClipboard" class="btn btn-sm btn-success">
              Skopiuj Token
          </button>
        </div>
  
        <div v-if="error" class="mt-4 alert alert-danger">
          <h6 class="alert-heading">Błąd Logowania:</h6>
          <p class="mb-0">{{ error }}</p>
        </div>
        
        <div v-if="message" class="mt-4 alert alert-info">
          <p class="mb-0">{{ message }}</p>
        </div>
  
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import axios from 'axios';
  
  // Stan formularza
  const email = ref('');
  const haslo = ref('');
  
  // Stan komunikacji
  const isLoading = ref(false);
  const token = ref(null);
  const tokenType = ref(null);
  const error = ref(null);
  const message = ref(null);
  
  // Adres endpointu logowania
  const LOGIN_URL = 'http://localhost:8080/api/auth/login';
  
  const handleLogin = async () => {
      // Resetowanie stanu
      token.value = null;
      tokenType.value = null;
      error.value = null;
      message.value = null;
      isLoading.value = true;
  
      try {
          const response = await axios.post(LOGIN_URL, {
              email: email.value,
              haslo: haslo.value
          });
          
          // Zapis tokenu i typu
          token.value = response.data.token;
          tokenType.value = response.data.typTokenu;
          message.value = `Zalogowano pomyślnie jako ${email.value}! Token jest gotowy do użycia.`;
          
          // Opcjonalne zapisanie tokenu do localStorage
          localStorage.setItem('jwtToken', token.value);
  
      } catch (err) {
    
        console.error("Błąd Axios:", err);
    
    if (err.response) {
      console.error("Błąd Axios:", err);
    
    let errorMessage = "Wystąpił nieznany błąd serwera."; 
    
    if (err.response) {
        const status = err.response.status;
        
        if (status === 401) {
            errorMessage = "Nieprawidłowy email lub hasło.";
        } else if (status === 429) {
            errorMessage = "Za dużo prób logowania. Spróbuj później.";
        } else if (err.response.data?.message) {
            errorMessage = err.response.data.message;
        } else {
            errorMessage = `Błąd serwera (${status})`;
        }
    } else if (err.request) {
        errorMessage = "Brak połączenia z serwerem. Sprawdź, czy backend działa.";
    }
    
    error.value = errorMessage;
  
  }
      } finally {
          isLoading.value = false;
      }
  };
  
  const copyToClipboard = async () => {
      if (token.value) {
          try {
              await navigator.clipboard.writeText(token.value);
              message.value = "Token JWT skopiowany do schowka!";
              error.value = null;
          } catch (err) {
              error.value = "Błąd kopiowania (wymagany https lub uprawnienia). Spróbuj ręcznie.";
          }
      }
  };
  </script>
  
  <style scoped>
  /* Dodatkowe style dla tego komponentu, używającej klas Bootstrapa */
  .card-title {
    font-weight: 600;
  }
  </style>