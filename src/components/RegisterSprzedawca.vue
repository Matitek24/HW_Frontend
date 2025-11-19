<template>
    <div class="register-modal" v-if="show">
      <div class="modal-overlay" @click="closeModal"></div>
      
      <div class="modal-content">
        <div class="modal-header text-center">
          <h3>Zarejestruj sprzedawcę </h3>
          <button @click="closeModal" class="btn-close">✕</button>
        </div>
  
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="email">Email sprzedawcy</label>
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              required 
              class="form-input"
              placeholder="sprzedawca@example.com">
          </div>
  
          <div class="form-group">
            <label for="haslo">Hasło</label>
            <input 
              type="password" 
              id="haslo" 
              v-model="haslo" 
              required 
              class="form-input"
              minlength="6"
              placeholder="Minimum 6 znaków">
          </div>
  
          <div class="form-group">
            <label for="haslo2">Powtórz hasło</label>
            <input 
              type="password" 
              id="haslo2" 
              v-model="haslo2" 
              required 
              class="form-input"
              placeholder="Powtórz hasło">
          </div>
  
          <button 
            type="submit" 
            :disabled="isLoading || haslo !== haslo2" 
            class="btn-submit">
            <span v-if="isLoading" class="spinner"></span>
            {{ isLoading ? 'Rejestrowanie...' : 'Zarejestruj sprzedawcę' }}
          </button>
  
          <p v-if="haslo !== haslo2 && haslo2.length > 0" class="error-text">
            Hasła muszą być identyczne
          </p>
        </form>
  
        <!-- Success -->
        <div v-if="success" class="alert alert-success">
          ✅ {{ success }}
        </div>
  
        <!-- Error -->
        <div v-if="error" class="alert alert-error">
          ❌ {{ error }}
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue';
  import api from '../utils/axios';
  
  const props = defineProps({
    show: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['close', 'success']);
  
  const email = ref('');
  const haslo = ref('');
  const haslo2 = ref('');
  const isLoading = ref(false);
  const error = ref(null);
  const success = ref(null);
  
  // Reset formularza gdy modal się otwiera
  watch(() => props.show, (newValue) => {
    if (newValue) {
      resetForm();
    }
  });
  
  const resetForm = () => {
    email.value = '';
    haslo.value = '';
    haslo2.value = '';
    error.value = null;
    success.value = null;
  };
  
  const handleRegister = async () => {
    error.value = null;
    success.value = null;
  
    // Walidacja
    if (haslo.value !== haslo2.value) {
      error.value = "Hasła muszą być identyczne";
      return;
    }
  
    if (haslo.value.length < 6) {
      error.value = "Hasło musi mieć minimum 6 znaków";
      return;
    }
  
    isLoading.value = true;
  
    try {
      // Użyj axios z automatycznym tokenem (interceptor)
      const response = await api.post('/auth/register-sprzedawca', {
        email: email.value,
        haslo: haslo.value
      });
  
      success.value = response.data;
      
      // Po 2 sekundach zamknij modal
      setTimeout(() => {
        emit('success', email.value);
        closeModal();
      }, 2000);
  
    } catch (err) {
      console.error('Błąd rejestracji:', err);
      error.value = err.response?.data || err.message || 'Wystąpił błąd';
    } finally {
      isLoading.value = false;
    }
  };
  
  const closeModal = () => {
    resetForm();
    emit('close');
  };
  </script>
  
  <style scoped>
  
  .register-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  
  .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(236, 236, 236, 0.6);
    backdrop-filter: blur(4px);
  }
  
  .modal-content {
    position: relative;
    background: white;
    border-radius: 20px;
    padding: 30px;
    max-width: 450px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease;
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
  }
  
  .modal-header h3 {
    color: #667eea;
    font-size: 24px;
    font-weight: 600;
    margin: 0;
  }
  
  .btn-close {
    background: none;
    border: none;
    font-size: 28px;
    color: #8896ab;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all 0.2s;
  }
  
  .btn-close:hover {
    background: #f7fafc;
    color: #4a5568;
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
  
  .form-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    font-size: 14px;
    transition: all 0.3s ease;
    background-color: #e2e2e2;
  }
  
  .form-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  .btn-submit {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .btn-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }
  
  .btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .error-text {
    color: #e53e3e;
    font-size: 13px;
    margin-top: 10px;
  }
  
  .alert {
    margin-top: 15px;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
  }
  
  .alert-success {
    background: #f0fdf4;
    color: #15803d;
    border-left: 4px solid #22c55e;
  }
  
  .alert-error {
    background: #fef2f2;
    color: #b91c1c;
    border-left: 4px solid #ef4444;
  }
  </style>