<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import maestroApi from '../api/maestro.api'
import Boton from '../components/ui/Boton.vue'

const misGrados = ref([])
const gradoSeleccionadoId = ref(null)
const estudiantes = ref([])
const registros = ref({})
const fecha = ref(new Date().toISOString().slice(0, 10))
const cargando = ref(false)
const guardando = ref(false)
const error = ref('')
const exito = ref('')
const asistenciaGuardada = ref(false)

const presentes = computed(() => Object.values(registros.value).filter(e => e === 'presente').length)
const ausentes = computed(() => Object.values(registros.value).filter(e => e === 'ausente').length)
const miGrado = computed(() => misGrados.value.find((g) => String(g.id_grado) === String(gradoSeleccionadoId.value)) || null)

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

async function cargarDatos() {
  if (!miGrado.value) return
  cargando.value = true
  error.value = ''
  exito.value = ''
  asistenciaGuardada.value = false

  try {
    const resEst = await maestroApi.listarEstudiantes({
      id_grado: miGrado.value.id_grado,
      anio_escolar: miGrado.value.anio_escolar,
    })
    const matriculas = resEst.data.data || []
    estudiantes.value = matriculas.map((m) => ({
      id_estudiante: m.id_estudiante,
      nombre_completo: m.estudiante?.nombre_completo || '—',
    }))

    registros.value = {}
    estudiantes.value.forEach((est) => {
      registros.value[est.id_estudiante] = 'presente'
    })

    try {
      const resAsis = await maestroApi.obtenerAsistencia({
        id_grado: miGrado.value.id_grado,
        fecha: fecha.value,
      })
      const existente = resAsis.data.data || []
      if (existente.length > 0) {
        existente.forEach((r) => { registros.value[r.id_estudiante] = r.estado })
        asistenciaGuardada.value = true
      }
    } catch { /* No existing attendance */ }
  } catch (err) {
    error.value = err.response?.data?.mensaje || 'Error al cargar datos'
  } finally {
    cargando.value = false
  }
}

async function cargarMisGrados() {
  const resGrados = await maestroApi.obtenerMisGrados()
  misGrados.value = resGrados.data.data || []

  const guardado = localStorage.getItem('cb_maestro_grado')
  const existeGuardado = misGrados.value.some((g) => String(g.id_grado) === String(guardado))
  gradoSeleccionadoId.value = existeGuardado ? guardado : misGrados.value[0]?.id_grado || null
  if (gradoSeleccionadoId.value) localStorage.setItem('cb_maestro_grado', String(gradoSeleccionadoId.value))
}

async function cambiarGrado(event) {
  gradoSeleccionadoId.value = event.target.value
  localStorage.setItem('cb_maestro_grado', String(gradoSeleccionadoId.value))
  await cargarDatos()
}

async function guardar() {
  guardando.value = true
  error.value = ''
  exito.value = ''
  try {
    const lista = Object.entries(registros.value).map(([id_estudiante, estado]) => ({
      id_estudiante: Number(id_estudiante),
      estado,
    }))
    await maestroApi.guardarAsistencia({
      id_grado: miGrado.value.id_grado,
      fecha: fecha.value,
      registros: lista,
    })
    exito.value = 'Asistencia guardada correctamente'
    asistenciaGuardada.value = true
  } catch (err) {
    error.value = err.response?.data?.mensaje || 'Error al guardar asistencia'
  } finally {
    guardando.value = false
  }
}

function marcarTodos(estado) {
  estudiantes.value.forEach((est) => { registros.value[est.id_estudiante] = estado })
}

watch(fecha, () => { if (miGrado.value) cargarDatos() })
onMounted(async () => {
  try {
    await cargarMisGrados()
    if (miGrado.value) await cargarDatos()
  } catch (err) {
    error.value = err.response?.data?.mensaje || 'Error al cargar datos'
  }
})
</script>

<template>
  <div>
    <div class="cabecera-pagina">
      <div>
        <h1 class="titulo-pagina">Pasar Asistencia</h1>
        <p class="subtitulo-pagina">Registra la asistencia diaria de tu grado</p>
      </div>
    </div>

    <div v-if="cargando" class="cargando-centro"><span class="spinner spinner-grande"></span></div>

    <div v-else-if="!miGrado" class="tarjeta vacio-estado">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--gris-300)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
      </svg>
      <p>No tienes un grado asignado. Contacta al administrador.</p>
    </div>

    <div v-else>
      <div v-if="error" class="alerta alerta-error">{{ error }}</div>
      <div v-if="exito" class="alerta alerta-exito">{{ exito }}</div>

      <div class="controles-barra">
        <div class="control-chips">
          <div class="control-chip">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/>
            </svg>
            <span>{{ miGrado.grado?.nombre || 'Grado' }}</span>
          </div>
          <div v-if="misGrados.length > 1" class="control-select-grado">
            <label class="campo-etiqueta">Grado</label>
            <select class="campo-select" :value="gradoSeleccionadoId" @change="cambiarGrado">
              <option v-for="g in misGrados" :key="g.id_asignacion || g.id_grado" :value="g.id_grado">
                {{ g.grado?.nombre || 'Grado' }} · {{ g.anio_escolar }}
              </option>
            </select>
          </div>
          <div class="control-chip">
            <span class="chip-num">{{ estudiantes.length }}</span>
            <span>estudiantes</span>
          </div>
        </div>
        <div class="control-derecho">
          <div class="control-fecha">
            <label class="campo-etiqueta">Fecha</label>
            <input type="date" v-model="fecha" class="campo-select" :max="hoy()" />
          </div>
        </div>
      </div>

      <div v-if="estudiantes.length" class="resumen-rapido">
        <div class="resumen-item resumen-presente">
          <span class="resumen-num">{{ presentes }}</span>
          <span class="resumen-label">Presentes</span>
        </div>
        <div class="resumen-item resumen-ausente">
          <span class="resumen-num">{{ ausentes }}</span>
          <span class="resumen-label">Ausentes</span>
        </div>
        <div class="resumen-acciones">
          <Boton tamano="sm" variante="secundario" @click="marcarTodos('presente')">Todos presentes</Boton>
          <Boton tamano="sm" variante="secundario" @click="marcarTodos('ausente')">Todos ausentes</Boton>
        </div>
      </div>

      <div v-if="estudiantes.length === 0" class="tarjeta vacio-estado">
        <p>No hay estudiantes inscritos en este grado.</p>
      </div>

      <div v-else class="tarjeta tabla-card">
        <div class="tabla-contenedor">
          <table class="tabla">
            <thead>
              <tr>
                <th style="width: 50px;">#</th>
                <th>Estudiante</th>
                <th style="width: 100px; text-align: center;">Presente</th>
                <th style="width: 100px; text-align: center;">Ausente</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(est, idx) in estudiantes" :key="est.id_estudiante">
                <td class="td-num">{{ idx + 1 }}</td>
                <td class="celda-nombre">{{ est.nombre_completo }}</td>
                <td class="td-radio">
                  <label class="radio-label">
                    <input type="radio" :name="`asist-${est.id_estudiante}`" value="presente" v-model="registros[est.id_estudiante]" />
                    <span class="radio-visual radio-ok">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                    </span>
                  </label>
                </td>
                <td class="td-radio">
                  <label class="radio-label">
                    <input type="radio" :name="`asist-${est.id_estudiante}`" value="ausente" v-model="registros[est.id_estudiante]" />
                    <span class="radio-visual radio-no">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </span>
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="estudiantes.length > 0" class="acciones-guardar">
        <Boton :cargando="guardando" @click="guardar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          Guardar asistencia
        </Boton>
      </div>

      <div v-if="asistenciaGuardada && exito" class="siguiente-card">
        <div class="siguiente-info">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
          </svg>
          <p>Asistencia registrada. ¿Deseas registrar el contenido de clase?</p>
        </div>
        <router-link to="/contenido">
          <Boton tamano="sm">Registrar contenido</Boton>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.controles-barra {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 16px;
  flex-wrap: wrap;
}

.control-chips {
  display: flex;
  gap: 8px;
}

.control-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: white;
  border: 1px solid var(--gris-200);
  border-radius: var(--radio-full);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--gris-700);
}

.chip-num {
  font-weight: 700;
  color: var(--primario);
}

.control-derecho {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.control-select-grado {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.control-fecha .campo-etiqueta {
  margin-bottom: 4px;
}

.resumen-rapido {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.resumen-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radio-sm);
  font-size: 0.8125rem;
  font-weight: 600;
}

.resumen-presente {
  background: var(--exito-claro);
  color: #065f46;
}

.resumen-ausente {
  background: var(--peligro-claro);
  color: #991b1b;
}

.resumen-num {
  font-size: 1.125rem;
  font-weight: 700;
}

.resumen-acciones {
  display: flex;
  gap: 6px;
  margin-left: auto;
}

.tabla-card { padding: 0; }
.td-num { text-align: center; color: var(--gris-400); font-size: 0.8125rem; }
.td-radio { text-align: center; }

.radio-label {
  display: inline-flex;
  cursor: pointer;
}

.radio-label input { position: absolute; opacity: 0; pointer-events: none; }

.radio-visual {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--gris-200);
  color: transparent;
  transition: all var(--transicion);
}

.radio-ok { }
.radio-no { }

.radio-label input:checked ~ .radio-ok {
  background: var(--exito-claro);
  border-color: var(--exito);
  color: var(--exito);
}

.radio-label input:checked ~ .radio-no {
  background: var(--peligro-claro);
  border-color: var(--peligro);
  color: var(--peligro);
}

.acciones-guardar {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.siguiente-card {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: var(--primario-claro);
  border: 1px solid var(--primario-200);
  border-radius: var(--radio);
  padding: 16px 20px;
}

.siguiente-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--primario-700);
  font-size: 0.875rem;
}

.vacio-estado {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--gris-400);
  font-size: 0.875rem;
  padding: 48px 24px;
  text-align: center;
}
</style>
