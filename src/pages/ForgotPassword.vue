<template>
    <div class="auth-container">
      <div class="login-card">
        <div class="login-header">
          <h2>Reset hasła 🔒</h2>
          <p>Podaj email, a wyślemy Ci instrukcję</p>
        </div>
        
        <form @submit.prevent="handleSendLink" v-if="!successMessage">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              required 
              class="form-control"
              placeholder="twoj@email.com">
          </div>
  
          <button type="submit" :disabled="isLoading" class="btn-login">
            <span v-if="isLoading" class="spinner-border"></span>
            {{ isLoading ? 'Wysyłanie...' : 'Wyślij link resetujący' }}
          </button>
          
          <div class="mt-3 text-center">
            <router-link to="/login" class="back-link">← Wróć do logowania</router-link>
          </div> 
        </form>
  
        <div v-else class="success-state">
          <div class="icon">📩</div>
          <h3>Sprawdź skrzynkę!</h3>
          <p>{{ successMessage }}</p>
          <router-link to="/login" class="btn-login" style="text-decoration: none; display: block; text-align: center;">
            Wróć do logowania
          </router-link>
        </div>
  
        <div v-if="error" class="alert-error">
          {{ error }}
        </div>
  
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import api from '../utils/axios';
  
  const email = ref('');
  const isLoading = ref(false);
  const error = ref(null);
  const successMessage = ref(null);
  
  const handleSendLink = async () => {
    error.value = null;
    isLoading.value = true;
  
    try {
      // Backend oczekuje @RequestParam, więc wysyłamy params
      await api.post('/auth/forgot-password', null, {
        params: { email: email.value }
      });
      
      successMessage.value = `Link resetujący został wysłany na adres ${email.value}. Sprawdź (również folder SPAM) oraz konsolę serwera backendu (tryb dev).`;
    } catch (err) {
      error.value = err.response?.data || "Wystąpił błąd podczas wysyłania linku.";
    } finally {
      isLoading.value = false;
    }
  };
  </script>
  
  <style scoped>
  /* Kopiujemy style z Login.vue dla spójności */
  .auth-container { display: flex; justify-content: center; align-items: center; min-height: 80vh; }
  .login-card { background: white; border-radius: 20px; padding: 40px; width: 100%; max-width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
  .login-header { text-align: center; margin-bottom: 30px; }
  .login-header h2 { color: #667eea; font-size: 26px; font-weight: 600; margin-bottom: 8px; }
  .login-header p { color: #8896ab; font-size: 14px; }
  .form-group { margin-bottom: 20px; }
  .form-control { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; transition: all 0.3s; }
  .form-control:focus { outline: none; border-color: #667eea; }
  .btn-login { width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: transform 0.2s; margin-top: 10px; }
  .btn-login:hover { transform: translateY(-2px); }
  .alert-error { margin-top: 20px; padding: 12px; background: #fee; border-left: 4px solid #e53e3e; color: #c53030; border-radius: 8px; font-size: 14px; }
  .back-link { color: #8896ab; font-size: 14px; text-decoration: none; }
  .back-link:hover { color: #667eea; }
  .spinner-border { width: 1rem; height: 1rem; border: 2px solid #fff; border-right-color: transparent; border-radius: 50%; display: inline-block; animation: spin .75s linear infinite; margin-right: 8px; }
  @keyframes spin { 100% { transform: rotate(360deg); } }
  
  .success-state { text-align: center; }
  .success-state .icon { font-size: 40px; margin-bottom: 15px; }
  .success-state h3 { color: #2f855a; margin-bottom: 10px; }
  .success-state p { color: #4a5568; margin-bottom: 20px; font-size: 14px; }
  </style>