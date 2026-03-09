<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../store/auth.store'

const auth = useAuthStore()
const route = useRoute()

const tituloPagina = computed(() => {
  const map = {
    '/dashboard': auth.rolUsuario === 'admin' ? 'Panel de Administración' : 'Mi Grado',
    '/asistencia': 'Pasar Asistencia',
    '/contenido': 'Contenido de Clase',
    '/justificantes': 'Justificantes',
    '/admin/maestros': 'Gestión de Maestros',
    '/admin/padres': 'Gestión de Padres',
    '/admin/estudiantes': 'Estudiantes',
    '/admin/grados': 'Grados y Asignaciones',
    '/admin/matriculas': 'Matrículas',
  }
  return map[route.path] || 'Dashboard'
})

const fechaHoy = computed(() => {
  return new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})
</script>

<template>
  <header class="topbar">
    <div class="topbar-izq">
      <h1 class="topbar-titulo">{{ tituloPagina }}</h1>
      <span class="topbar-fecha">{{ fechaHoy }}</span>
    </div>
    <div class="topbar-der">
      <div class="topbar-notificacion" title="Notificaciones">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
      </div>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  height: var(--topbar-alto);
  background: linear-gradient(180deg, #ffffff 0%, #f7faff 100%);
  border-bottom: 1px solid #dbe5ff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.topbar-izq {
  display: flex;
  flex-direction: column;
}

.topbar-titulo {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--gris-900);
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.topbar-fecha {
  font-size: 0.75rem;
  color: var(--gris-400);
  text-transform: capitalize;
}

.topbar-der {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar-notificacion {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gris-500);
  cursor: pointer;
  transition: all var(--transicion);
}

.topbar-notificacion:hover {
  background: #eaf1ff;
  color: var(--azul-600);
}
</style>
