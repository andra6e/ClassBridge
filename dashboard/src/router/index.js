import { createRouter, createWebHistory } from 'vue-router'

const rutas = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { publica: true },
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
  },
  {
    path: '/grupos',
    name: 'grupos',
    component: () => import('../views/GruposView.vue'),
  },
  {
    path: '/asistencia/:id_grupo',
    name: 'asistencia',
    component: () => import('../views/PaseListaView.vue'),
    props: true,
  },
  {
    path: '/contenido/:id_sesion',
    name: 'contenido',
    component: () => import('../views/ContenidoDiaView.vue'),
    props: true,
  },
  {
    path: '/justificantes',
    name: 'justificantes',
    component: () => import('../views/JustificantesView.vue'),
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/admin/AdminHomeView.vue'),
    meta: { rolRequerido: 'admin' },
  },
  {
    path: '/admin/maestros',
    name: 'admin-maestros',
    component: () => import('../views/admin/AdminMaestrosView.vue'),
    meta: { rolRequerido: 'admin' },
  },
  {
    path: '/admin/grupos',
    name: 'admin-grupos',
    component: () => import('../views/admin/AdminGruposView.vue'),
    meta: { rolRequerido: 'admin' },
  },
  {
    path: '/admin/estudiantes',
    name: 'admin-estudiantes',
    component: () => import('../views/admin/AdminEstudiantesView.vue'),
    meta: { rolRequerido: 'admin' },
  },
  {
    path: '/admin/matriculas',
    name: 'admin-matriculas',
    component: () => import('../views/admin/AdminMatriculasView.vue'),
    meta: { rolRequerido: 'admin' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes: rutas,
})

router.beforeEach((to) => {
  const token = localStorage.getItem('cb_token')
  if (!to.meta.publica && !token) {
    return { name: 'login' }
  }
  if (to.name === 'login' && token) {
    return { name: 'dashboard' }
  }
  if (to.meta.rolRequerido) {
    const usuario = JSON.parse(localStorage.getItem('cb_usuario') || '{}')
    if (usuario.rol !== to.meta.rolRequerido) {
      return { name: 'dashboard' }
    }
  }
})

export default router
