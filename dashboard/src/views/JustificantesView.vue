<script setup>
import { ref, onMounted } from 'vue'
import justificantesApi from '../api/justificantes.api'
import Boton from '../components/ui/Boton.vue'

const justificantes = ref([])
const cargando = ref(false)
const procesandoId = ref(null)
const error = ref('')
const exito = ref('')

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    const res = await justificantesApi.listarPendientes()
    justificantes.value = res.data.data || []
  } catch (err) {
    error.value = err.response?.data?.mensaje || 'Error al cargar justificantes'
  } finally {
    cargando.value = false
  }
}

async function revisar(id, estado) {
  procesandoId.value = id
  error.value = ''
  exito.value = ''
  try {
    await justificantesApi.revisar(id, estado)
    exito.value = estado === 'aprobado' ? 'Justificante aprobado' : 'Justificante rechazado'
    await cargar()
  } catch (err) {
    error.value = err.response?.data?.mensaje || 'Error al procesar justificante'
  } finally {
    procesandoId.value = null
  }
}

function formatearFecha(fecha) {
  if (!fecha) return ''
  const d = new Date(fecha)
  return d.toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(cargar)
</script>

<template>
  <div>
    <div class="cabecera-pagina">
      <div>
        <h1 class="titulo-pagina">Justificantes Pendientes</h1>
        <p class="subtitulo-pagina">Revisa y gestiona los justificantes enviados por los padres</p>
      </div>
      <div v-if="justificantes.length" class="contador-badge">
        {{ justificantes.length }} pendiente{{ justificantes.length > 1 ? 's' : '' }}
      </div>
    </div>

    <div v-if="error" class="alerta alerta-error">{{ error }}</div>
    <div v-if="exito" class="alerta alerta-exito">{{ exito }}</div>

    <div v-if="cargando" class="cargando-centro"><span class="spinner spinner-grande"></span></div>

    <div v-else-if="justificantes.length === 0" class="tarjeta vacio-estado">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--gris-300)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
        <path d="M22 4L12 14.01l-3-3"/>
      </svg>
      <p style="font-weight: 500;">No hay justificantes pendientes</p>
      <span style="font-size: 0.75rem;">Los justificantes aparecerán aquí cuando los padres los envíen</span>
    </div>

    <div v-else class="lista-justificantes">
      <div
        v-for="just in justificantes"
        :key="just.id_justificante"
        class="justificante-card"
      >
        <div class="just-izq">
          <div class="just-avatar">
            {{ (just.estudiante?.nombre_completo || just.asistencia?.estudiante?.nombre_completo || 'E')?.charAt(0)?.toUpperCase() }}
          </div>
          <div class="just-info">
            <h3 class="just-nombre">{{ just.estudiante?.nombre_completo || just.asistencia?.estudiante?.nombre_completo || 'Estudiante' }}</h3>
            <div class="just-meta">
              <span class="just-meta-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
                {{ formatearFecha(just.fecha || just.asistencia?.fecha) }}
              </span>
              <span class="just-meta-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                </svg>
                {{ just.padre?.nombre_completo || just.emisor?.nombre_completo || 'Padre' }}
              </span>
            </div>
            <div class="just-motivo">
              <span class="motivo-label">Motivo:</span>
              {{ just.motivo }}
            </div>
          </div>
        </div>
        <div class="just-acciones">
          <Boton
            variante="exito"
            tamano="sm"
            :cargando="procesandoId === just.id_justificante"
            :deshabilitado="procesandoId !== null"
            @click="revisar(just.id_justificante, 'aprobado')"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>
            Aprobar
          </Boton>
          <Boton
            variante="fantasma"
            tamano="sm"
            :cargando="procesandoId === just.id_justificante"
            :deshabilitado="procesandoId !== null"
            @click="revisar(just.id_justificante, 'rechazado')"
          >
            Rechazar
          </Boton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contador-badge {
  background: var(--advertencia-claro);
  color: #92400e;
  padding: 4px 12px;
  border-radius: var(--radio-full);
  font-size: 0.8125rem;
  font-weight: 600;
}

.vacio-estado {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--gris-400);
  font-size: 0.875rem;
  padding: 64px 24px;
  text-align: center;
}

.lista-justificantes {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.justificante-card {
  background: white;
  border: 1px solid var(--gris-200);
  border-radius: var(--radio);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  transition: all var(--transicion);
}

.justificante-card:hover {
  border-color: var(--gris-300);
  box-shadow: var(--sombra);
}

.just-izq {
  display: flex;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.just-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #fffbeb;
  color: #92400e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9375rem;
  flex-shrink: 0;
}

.just-info {
  min-width: 0;
  flex: 1;
}

.just-nombre {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--gris-900);
  margin-bottom: 4px;
}

.just-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.just-meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--gris-500);
}

.just-motivo {
  font-size: 0.8125rem;
  color: var(--gris-600);
  line-height: 1.5;
}

.motivo-label {
  font-weight: 600;
  color: var(--gris-700);
}

.just-acciones {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  padding-top: 2px;
}

@media (max-width: 640px) {
  .justificante-card { flex-direction: column; }
  .just-acciones { width: 100%; }
}
</style>
