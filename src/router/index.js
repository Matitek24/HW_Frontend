import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../pages/LoginPage.vue';
import DashboardPage from '../pages/Dashboard.vue';
import Czapka from '../pages/Czapka.vue';
import ForgotPassword from '../pages/ForgotPassword.vue';
import ResetPassword from '../pages/ResetPassword.vue';
import LeadsView from '../pages/LeadsView.vue';

const routes = [
  {
    path: '/',
    name: 'Czapka',
    component: Czapka
  },

  {
    path: '/projekt/:id',
    name: 'UUID_Project',
    component: Czapka,
    props: true
  },

  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true }
  },
  
  {
    path: '/leads',
    name: 'Leads',
    component: LeadsView,
    meta: { requiresAuth: true }
  },
  
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },

  { path: '/forgot-password', component: ForgotPassword },
  { path: '/reset-password', component: ResetPassword },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0, behavior: 'smooth' };
    }
  }
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('jwtToken');
  
  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else if (to.path === '/login' && token) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;