import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../pages/LoginPage.vue';
import DashboardPage from '../pages/Dashboard.vue';
import Czapka from '../pages/Czapka.vue';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/czapka',
    name: 'Czapka',
    component: Czapka,
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Guard - sprawdza token przed wejściem na chronioną stronę
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('jwtToken');
  
  if (to.meta.requiresAuth && !token) {
    next('/');
  } else if (to.path === '/' && token) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;