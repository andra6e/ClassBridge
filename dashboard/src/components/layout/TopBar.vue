<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../store/auth.store'
import movimientosApi from '../../api/movimientos.api'

const auth = useAuthStore()
const route = useRoute()
const abierto = ref(false)
const movimientos = ref([])
const cargandoMov = ref(false)

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

const puedeVerMovimientos = computed(() => ['admin', 'maestro'].includes(auth.rolUsuario || ''))

async function cargarMovimientos() {
  if (!puedeVerMovimientos.value) return
  cargandoMov.value = true
  try {
    const res = await movimientosApi.listarMios(20)
    movimientos.value = res.data?.data || []
  } catch {
    movimientos.value = []
  } finally {
    cargandoMov.value = false
  }
}

function toggleMovimientos() {
  abierto.value = !abierto.value
  if (abierto.value) cargarMovimientos()
}

function formatear(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })
}

onMounted(cargarMovimientos)
</script>

<template>
  <header class="topbar">
    <div class="topbar-izq">
      <h1 class="topbar-titulo">{{ tituloPagina }}</h1>
      <span class="topbar-fecha">{{ fechaHoy }}</span>
    </div>
    <div class="topbar-der">
      <div v-if="puedeVerMovimientos" class="topbar-notificacion" title="Notificaciones" @click="toggleMovimientos">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        <span v-if="movimientos.length" class="badge-mov">{{ movimientos.length }}</span>
      </div>
      <div v-if="abierto && puedeVerMovimientos" class="panel-movimientos">
        <div class="panel-title">Historial de movimientos</div>
        <div v-if="cargandoMov" class="panel-empty">Cargando...</div>
        <div v-else-if="!movimientos.length" class="panel-empty">Sin movimientos recientes</div>
        <div v-else class="lista-mov">
          <div v-for="m in movimientos" :key="m.id_movimiento" class="item-mov">
            <div class="item-accion">{{ m.accion }}</div>
            <div class="item-detalle">{{ m.detalle || '—' }}</div>
            <div class="item-fecha">{{ formatear(m.createdAt) }}</div>
          </div>
        </div>
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
  position: relative;
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

.badge-mov {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 16px;
  height: 16px;
  border-radius: 999px;
  background: var(--peligro);
  color: white;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.panel-movimientos {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 340px;
  max-height: 360px;
  overflow: auto;
  background: white;
  border: 1px solid var(--gris-200);
  border-radius: var(--radio);
  box-shadow: var(--sombra-lg);
  z-index: 200;
}

.panel-title {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--gris-700);
  padding: 10px 12px;
  border-bottom: 1px solid var(--gris-100);
}

.panel-empty {
  font-size: 0.8125rem;
  color: var(--gris-500);
  padding: 16px 12px;
}

.item-mov {
  padding: 10px 12px;
  border-bottom: 1px solid var(--gris-100);
}

.item-mov:last-child {
  border-bottom: none;
}

.item-accion {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--gris-700);
  text-transform: uppercase;
}

.item-detalle {
  font-size: 0.8125rem;
  color: var(--gris-700);
  margin-top: 4px;
}

.item-fecha {
  font-size: 0.6875rem;
  color: var(--gris-400);
  margin-top: 4px;
}
</style>
