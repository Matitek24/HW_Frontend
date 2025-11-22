import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../pages/LoginPage.vue';
import DashboardPage from '../pages/Dashboard.vue';
import Czapka from '../pages/Czapka.vue';
import ForgotPassword from '../pages/ForgotPassword.vue';
import ResetPassword from '../pages/ResetPassword.vue';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Czapka
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Czapka',
    component: LoginPage,
  },
  { path: '/forgot-password', component: ForgotPassword },
  { path: '/reset-password', component: ResetPassword },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

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