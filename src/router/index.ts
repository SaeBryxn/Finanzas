import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },
    { path: '/', redirect: '/clientes', meta: { requiresAuth: true } },
    { path: '/config', name: 'config', component: () => import('@/views/ConfigView.vue'), meta: { requiresAuth: true } },
    { path: '/clientes', name: 'clientes', component: () => import('@/views/ClientesView.vue'), meta: { requiresAuth: true } },
    { path: '/unidades', name: 'unidades', component: () => import('@/views/UnidadesView.vue'), meta: { requiresAuth: true } },
    { path: '/simulador', name: 'simulador', component: () => import('@/views/SimuladorView.vue'), meta: { requiresAuth: true } },
    { path: '/historial', name: 'historial', component: () => import('@/views/HistorialView.vue'), meta: { requiresAuth: true } },
    { path: '/auditoria', name: 'auditoria', component: () => import('@/views/AuditoriaView.vue'), meta: { requiresAuth: true } },
    { path: '/ayuda', name: 'ayuda', component: () => import('@/views/AyudaView.vue'), meta: { requiresAuth: true } }
  ]
})

// renombra parámetros no usados con _
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'clientes' })
  } else {
    next()
  }
})

export default router
