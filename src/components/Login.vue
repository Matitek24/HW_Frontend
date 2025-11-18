<template>
  <div class="login-card">
    <div class="login-header">
      <h2>Headwear</h2>
      <p>Zaloguj się do swojego konta</p>
    </div>
    
    <form @submit.prevent="handleLogin">
      
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

      <div class="form-group">
        <label for="haslo">Hasło</label>
        <input 
          type="password" 
          id="haslo" 
          v-model="haslo" 
          required 
          class="form-control"
          placeholder="••••••••">
      </div>

      <button type="submit" :disabled="isLoading" class="btn-login">
        <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
        {{ isLoading ? 'Logowanie...' : 'Zaloguj się' }}
      </button>
    </form>

    <!-- Komunikaty błędów -->
    <div v-if="error" class="alert-error">
      <i class="bi bi-exclamation-circle"></i>
      {{ error }}
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const email = ref('');
const haslo = ref('');
const isLoading = ref(false);
const error = ref(null);

const LOGIN_URL = 'http://localhost:8080/api/auth/login';

const handleLogin = async () => {
  error.value = null;
  isLoading.value = true;

  try {
    const response = await axios.post(LOGIN_URL, {
      email: email.value,
      haslo: haslo.value
    });
    
    // Zapis tokenu
    const token = response.data.token;
    localStorage.setItem('jwtToken', token);
    localStorage.setItem('userEmail', email.value);

    // PRZEKIEROWANIE DO DASHBOARD! 🎉
    router.push('/dashboard');

  } catch (err) {
    console.error("Błąd logowania:", err);
    
    if (err.response) {
      const status = err.response.status;
      
      if (status === 401) {
        error.value = "Nieprawidłowy email lub hasło";
      } else if (status === 429) {
        error.value = "Za dużo prób. Spróbuj za chwilę";
      } else {
        error.value = err.response.data?.message || `Błąd serwera (${status})`;
      }
    } else {
      error.value = "Brak połączenia z serwerem";
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #1f5a96;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
}

.login-header p {
  color: #8896ab;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #4a5568;
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-login {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #66a8ea 0%, #4b79a2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-top: 10px;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alert-error {
  margin-top: 20px;
  padding: 12px 16px;
  background: #fee;
  border-left: 4px solid #e53e3e;
  border-radius: 8px;
  color: #c53030;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>