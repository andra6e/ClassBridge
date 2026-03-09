<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Home,
  ClipboardList,
  BookOpen,
  Mail,
  Users,
  UserRound,
  GraduationCap,
  Layers,
  FileText,
  LogOut,
} from 'lucide-vue-next'
import { useAuthStore } from '../../store/auth.store'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const enlacesMaestro = [
  { nombre: 'Mi Grado', ruta: '/dashboard', icono: Home },
  { nombre: 'Asistencia', ruta: '/asistencia', icono: ClipboardList },
  { nombre: 'Contenido', ruta: '/contenido', icono: BookOpen },
  { nombre: 'Justificantes', ruta: '/justificantes', icono: Mail },
]

const enlacesAdmin = [
  { nombre: 'Inicio', ruta: '/dashboard', icono: Home },
  { nombre: 'Maestros', ruta: '/admin/maestros', icono: Users },
  { nombre: 'Padres', ruta: '/admin/padres', icono: UserRound },
  { nombre: 'Estudiantes', ruta: '/admin/estudiantes', icono: GraduationCap },
  { nombre: 'Grados', ruta: '/admin/grados', icono: Layers },
  { nombre: 'Matrículas', ruta: '/admin/matriculas', icono: FileText },
]

const enlaces = computed(() => auth.rolUsuario === 'admin' ? enlacesAdmin : enlacesMaestro)

function esActivo(ruta) {
  if (ruta === '/dashboard') return route.path === '/dashboard' || route.path === '/'
  return route.path.startsWith(ruta)
}

function cerrarSesion() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-marca">
      <div class="marca-icono">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 10L12 5 2 10l10 5 10-5z"/>
          <path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/>
        </svg>
      </div>
      <div class="marca-texto">
        <span class="marca-nombre">ClassBridge</span>
        <span class="marca-rol">{{ auth.rolUsuario === 'admin' ? 'Administrador' : 'Maestro' }}</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <span class="nav-seccion">Menú principal</span>
      <router-link
        v-for="enlace in enlaces"
        :key="enlace.ruta"
        :to="enlace.ruta"
        class="nav-enlace"
        :class="{ 'nav-enlace-activo': esActivo(enlace.ruta) }"
      >
        <component :is="enlace.icono" class="nav-icono" :size="19" :stroke-width="2.2" />
        <span class="nav-texto">{{ enlace.nombre }}</span>
      </router-link>
    </nav>

    <div class="sidebar-pie">
      <div class="sidebar-usuario">
        <div class="usuario-avatar">{{ auth.nombreUsuario?.charAt(0)?.toUpperCase() || 'U' }}</div>
        <div class="usuario-info">
          <span class="usuario-nombre">{{ auth.nombreUsuario }}</span>
          <span class="usuario-rol">{{ auth.rolUsuario }}</span>
        </div>
      </div>
      <button class="btn-salir" @click="cerrarSesion" title="Cerrar sesión">
        <LogOut :size="18" :stroke-width="2.2" />
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-ancho);
  height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #f5f8ff 100%);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  border-right: 1px solid var(--gris-200);
}

.sidebar-marca {
  padding: 20px 20px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--gris-100);
}

.marca-icono {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--primario);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.marca-texto {
  display: flex;
  flex-direction: column;
}

.marca-nombre {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gris-900);
  letter-spacing: -0.02em;
}

.marca-rol {
  font-size: 0.6875rem;
  color: var(--gris-400);
  font-weight: 500;
  text-transform: capitalize;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.nav-seccion {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--gris-400);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0 8px;
  margin-bottom: 8px;
}

.nav-enlace {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: var(--radio-sm);
  color: #3f4c74;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--transicion);
  text-decoration: none;
}

.nav-enlace:hover {
  background: #eef3ff;
  color: #334077;
}

.nav-enlace-activo {
  background: linear-gradient(90deg, #4f46e5 0%, #6366f1 100%);
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 8px 18px rgba(79, 70, 229, 0.22);
}

.nav-enlace-activo:hover {
  background: linear-gradient(90deg, #4338ca 0%, #4f46e5 100%);
  color: #ffffff;
}

.nav-icono {
  width: 21px;
  height: 21px;
  flex-shrink: 0;
  opacity: 0.95;
}

.nav-texto {
  line-height: 1;
}

.sidebar-pie {
  padding: 12px 16px;
  border-top: 1px solid var(--gris-100);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-usuario {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.usuario-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--primario-claro);
  color: var(--primario);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8125rem;
  flex-shrink: 0;
}

.usuario-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.usuario-nombre {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--gris-800);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.usuario-rol {
  font-size: 0.6875rem;
  color: var(--gris-400);
  text-transform: capitalize;
}

.btn-salir {
  background: none;
  border: none;
  color: var(--gris-400);
  padding: 6px;
  border-radius: 6px;
  transition: all var(--transicion);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-salir:hover {
  background: var(--peligro-claro);
  color: var(--peligro);
}
</style>
