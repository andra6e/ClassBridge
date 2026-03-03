<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth.store'

const router = useRouter()
const auth = useAuthStore()

const enlaces = [
  { nombre: 'Dashboard', ruta: '/dashboard', icono: '&#9632;' },
  { nombre: 'Grupos', ruta: '/grupos', icono: '&#9654;' },
  { nombre: 'Justificantes', ruta: '/justificantes', icono: '&#9998;' },
]

const enlacesAdmin = [
  { nombre: 'Administracion', ruta: '/admin', icono: '&#9881;' },
  { nombre: 'Maestros', ruta: '/admin/maestros', icono: '&#9679;' },
  { nombre: 'Grupos', ruta: '/admin/grupos', icono: '&#9679;' },
  { nombre: 'Estudiantes', ruta: '/admin/estudiantes', icono: '&#9679;' },
  { nombre: 'Matriculas', ruta: '/admin/matriculas', icono: '&#9679;' },
]

const esAdmin = computed(() => auth.rolUsuario === 'admin')

function cerrarSesion() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <span class="logo-texto">ClassBridge</span>
      <span class="logo-sub">Dashboard</span>
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="enlace in enlaces"
        :key="enlace.ruta"
        :to="enlace.ruta"
        class="sidebar-enlace"
        active-class="sidebar-enlace-activo"
      >
        <span class="enlace-icono" v-html="enlace.icono"></span>
        {{ enlace.nombre }}
      </router-link>

      <template v-if="esAdmin">
        <div class="sidebar-separador"></div>
        <router-link
          v-for="enlace in enlacesAdmin"
          :key="enlace.ruta"
          :to="enlace.ruta"
          class="sidebar-enlace"
          active-class="sidebar-enlace-activo"
        >
          <span class="enlace-icono" v-html="enlace.icono"></span>
          {{ enlace.nombre }}
        </router-link>
      </template>
    </nav>

    <div class="sidebar-pie">
      <button class="btn-cerrar-sesion" @click="cerrarSesion">
        Cerrar sesion
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 240px;
  height: 100vh;
  background: var(--gris-900);
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
}

.sidebar-logo {
  padding: 24px 20px;
  border-bottom: 1px solid var(--gris-700);
  display: flex;
  flex-direction: column;
}

.logo-texto {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.logo-sub {
  font-size: 0.75rem;
  color: var(--gris-400);
  margin-top: 2px;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-enlace {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 6px;
  color: var(--gris-300);
  font-size: 0.9rem;
  font-weight: 500;
  transition: all var(--transicion);
  text-decoration: none;
}

.sidebar-enlace:hover {
  background: var(--gris-700);
  color: white;
}

.sidebar-enlace-activo {
  background: var(--primario);
  color: white;
}

.enlace-icono {
  font-size: 1rem;
  width: 20px;
  text-align: center;
}

.sidebar-separador {
  height: 1px;
  background: var(--gris-700);
  margin: 12px 0;
}

.sidebar-pie {
  padding: 16px 12px;
  border-top: 1px solid var(--gris-700);
}

.btn-cerrar-sesion {
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1px solid var(--gris-600);
  color: var(--gris-300);
  border-radius: 6px;
  font-size: 0.85rem;
  transition: all var(--transicion);
}

.btn-cerrar-sesion:hover {
  background: var(--peligro);
  border-color: var(--peligro);
  color: white;
}
</style>
