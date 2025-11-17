<template>
    <div class="dashboard-card">
      <div class="dashboard-header">
        <div>
          <h2>Dashboard 🚀</h2>
          <p>Witaj, <strong>{{ userEmail }}</strong>!</p>
        </div>
        <button @click="handleLogout" class="btn-logout">
          Wyloguj
        </button>
      </div>
  
      <div class="token-section">
        <h3>Twój JWT Token</h3>
        <div class="token-display">
          {{ displayToken }}
        </div>
        <button @click="copyToken" class="btn-copy">
          {{ copied ? '✓ Skopiowano!' : 'Skopiuj token' }}
        </button>
      </div>
  
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🔐</div>
          <div class="stat-label">Status</div>
          <div class="stat-value">Zalogowany</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">⏰</div>
          <div class="stat-label">Czas logowania</div>
          <div class="stat-value">{{ loginTime }}</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">✨</div>
          <div class="stat-label">Token ważny</div>
          <div class="stat-value">Tak</div>
        </div>
      </div>
  
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  
  const userEmail = ref('');
  const jwtToken = ref('');
  const loginTime = ref('');
  const copied = ref(false);
  
  onMounted(() => {
    const token = localStorage.getItem('jwtToken');
    const email = localStorage.getItem('userEmail');
    
    if (!token) {
      router.push('/');
      return;
    }
    
    jwtToken.value = token;
    userEmail.value = email || 'Użytkownik';
    
    // Aktualny czas
    const now = new Date();
    loginTime.value = now.toLocaleTimeString('pl-PL');
  });
  
  const displayToken = computed(() => {
    if (jwtToken.value.length > 50) {
      return jwtToken.value.substring(0, 30) + '...' + jwtToken.value.substring(jwtToken.value.length - 20);
    }
    return jwtToken.value;
  });
  
  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(jwtToken.value);
      copied.value = true;
      setTimeout(() => {
        copied.value = false;
      }, 2000);
    } catch (err) {
      alert('Błąd kopiowania!');
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userEmail');
    router.push('/');
  };
  </script>
  
  <style scoped>
  .dashboard-card {
    max-width: 900px;
    margin: 40px auto;
    background: white;
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }
  
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 2px solid #e2e8f0;
  }
  
  .dashboard-header h2 {
    color: #667eea;
    font-size: 32px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .dashboard-header p {
    color: #8896ab;
    font-size: 14px;
  }
  
  .btn-logout {
    padding: 10px 20px;
    background: white;
    color: #667eea;
    border: 2px solid #667eea;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .btn-logout:hover {
    background: #667eea;
    color: white;
  }
  
  .token-section {
    background: #f7fafc;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 30px;
  }
  
  .token-section h3 {
    color: #4a5568;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
  }
  
  .token-display {
    background: white;
    padding: 15px;
    border-radius: 8px;
    border: 2px solid #e2e8f0;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    color: #4a5568;
    word-break: break-all;
    margin-bottom: 12px;
  }
  
  .btn-copy {
    padding: 8px 16px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .btn-copy:hover {
    background: #5568d3;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }
  
  .stat-card {
    background: linear-gradient(135deg, #1b80b254 0%, #1981b1 100%);
    padding: 25px;
    border-radius: 12px;
    text-align: center;
    color: white;
  }
  
  .stat-icon {
    font-size: 36px;
    margin-bottom: 10px;
  }
  
  .stat-label {
    font-size: 12px;
    opacity: 0.9;
    margin-bottom: 5px;
  }
  
  .stat-value {
    font-size: 20px;
    font-weight: 600;
  }
  </style>