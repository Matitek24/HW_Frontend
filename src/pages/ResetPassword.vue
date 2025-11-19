<template>
    <div class="auth-container">
      <div class="login-card">
        <div class="login-header">
          <h2>Nowe hasło 🔑</h2>
          <p>Wprowadź nowe hasło dla swojego konta</p>
        </div>
        
        <form @submit.prevent="handleReset" v-if="!success">
          <div class="form-group">
            <label>Nowe hasło</label>
            <input type="password" v-model="password" required minlength="6" class="form-control" placeholder="••••••••">
          </div>
  
          <div class="form-group">
            <label>Powtórz hasło</label>
            <input type="password" v-model="confirmPassword" required class="form-control" placeholder="••••••••">
          </div>
  
          <p v-if="password !== confirmPassword && confirmPassword" class="error-text">Hasła nie są identyczne</p>
  
          <button type="submit" :disabled="isLoading || password !== confirmPassword" class="btn-login">
            <span v-if="isLoading" class="spinner-border"></span>
            {{ isLoading ? 'Zmieniam...' : 'Zmień hasło' }}
          </button>
        </form>
  
        <div v-else class="success-state">
          <div class="icon">✅</div>
          <h3>Gotowe!</h3>
          <p>Hasło zostało zmienione pomyślnie.</p>
          <router-link to="/" class="btn-login" style="text-decoration: none; display: block; text-align: center;">
            Zaloguj się nowym hasłem
          </router-link>
        </div>
  
        <div v-if="error" class="alert-error">
          {{ error }}
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import api from '../utils/axios';
  
  const route = useRoute();
  const router = useRouter();
  
  const password = ref('');
  const confirmPassword = ref('');
  const token = ref('');
  const isLoading = ref(false);
  const error = ref(null);
  const success = ref(false);
  
  onMounted(() => {
    // Pobieramy token z URL (np. ?token=xyz)
    token.value = route.query.token;
    if (!token.value) {
      error.value = "Brak tokenu resetującego. Kliknij w link z emaila ponownie.";
    }
  });
  
  const handleReset = async () => {
    if (password.value !== confirmPassword.value) return;
    
    error.value = null;
    isLoading.value = true;
  
    try {
      // Wysyłamy request. Backend oczekiwał: @RequestParam token, @RequestBody hasło
      await api.post('/auth/reset-password', password.value, {
        params: { token: token.value },
        headers: { 'Content-Type': 'text/plain' } // Ważne, bo wysyłamy String jako body
      });
      
      success.value = true;
      
      // Opcjonalnie przekieruj automatycznie po 3 sekundach
      setTimeout(() => {
        router.push('/');
      }, 3000);
  
    } catch (err) {
      error.value = err.response?.data || "Nie udało się zmienić hasła. Token mógł wygasnąć.";
    } finally {
      isLoading.value = false;
    }
  };
  </script>
  
  <style scoped>
  /* Te same style co wyżej */
  .auth-container { display: flex; justify-content: center; align-items: center; min-height: 80vh; }
  .login-card { background: white; border-radius: 20px; padding: 40px; width: 100%; max-width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
  .login-header { text-align: center; margin-bottom: 30px; }
  .login-header h2 { color: #667eea; font-size: 26px; font-weight: 600; margin-bottom: 8px; }
  .login-header p { color: #8896ab; font-size: 14px; }
  .form-group { margin-bottom: 20px; }
  .form-control { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; transition: all 0.3s; }
  .form-control:focus { outline: none; border-color: #667eea; }
  .btn-login { width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: transform 0.2s; margin-top: 10px; }
  .btn-login:hover:not(:disabled) { transform: translateY(-2px); }
  .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }
  .alert-error { margin-top: 20px; padding: 12px; background: #fee; border-left: 4px solid #e53e3e; color: #c53030; border-radius: 8px; font-size: 14px; }
  .error-text { color: #e53e3e; font-size: 12px; margin-top: -15px; margin-bottom: 15px; }
  .spinner-border { width: 1rem; height: 1rem; border: 2px solid #fff; border-right-color: transparent; border-radius: 50%; display: inline-block; animation: spin .75s linear infinite; margin-right: 8px; }
  @keyframes spin { 100% { transform: rotate(360deg); } }
  .success-state { text-align: center; }
  .success-state .icon { font-size: 40px; margin-bottom: 15px; }
  .success-state h3 { color: #2f855a; margin-bottom: 10px; }
  .success-state p { color: #4a5568; margin-bottom: 20px; font-size: 14px; }
  </style>