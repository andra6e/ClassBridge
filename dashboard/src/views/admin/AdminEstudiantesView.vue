<script setup>
import { ref, onMounted, computed } from 'vue'
import adminApi from '../../api/admin.api'

const estudiantes = ref([])
const grados = ref([])
const cargando = ref(true)
const alerta = ref({ tipo: '', mensaje: '' })
const filtroGrado = ref('')

function mostrarAlerta(tipo, mensaje) {
  alerta.value = { tipo, mensaje }
  setTimeout(() => { alerta.value = { tipo: '', mensaje: '' } }, 4000)
}

function formatearFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
}

function obtenerGrado(est) {
  const matriculas = est.matriculas || est.Matriculas
  if (matriculas?.length) {
    const mat = matriculas.find((m) => m.estado === 'activa') || matriculas[matriculas.length - 1]
    return mat?.grado?.nombre || mat?.Grado?.nombre || '—'
  }
  return '—'
}

function obtenerPadre(est) {
  const matriculas = est.matriculas || est.Matriculas
  if (matriculas?.length) {
    const mat = matriculas.find((m) => m.estado === 'activa') || matriculas[matriculas.length - 1]
    return mat?.padre?.nombre_completo || mat?.Padre?.nombre_completo || '—'
  }
  return '—'
}

const estudiantesFiltrados = computed(() => {
  if (!filtroGrado.value) return estudiantes.value
  return estudiantes.value.filter((est) => obtenerGrado(est) === filtroGrado.value)
})

async function cargarEstudiantes() {
  cargando.value = true
  try {
    const [eRes, gRes] = await Promise.all([
      adminApi.listarEstudiantes(),
      adminApi.listarGrados(),
    ])
    estudiantes.value = eRes.data.data || []
    grados.value = gRes.data.data || []
  } catch {
    mostrarAlerta('error', 'Error al cargar estudiantes')
  }
  cargando.value = false
}

onMounted(cargarEstudiantes)
</script>

<template>
  <div>
    <div class="cabecera-pagina">
      <div>
        <h1 class="titulo-pagina">Estudiantes</h1>
        <p class="subtitulo-pagina">Todos los estudiantes registrados en el sistema</p>
      </div>
    </div>

    <div v-if="alerta.mensaje" class="alerta" :class="`alerta-${alerta.tipo}`">{{ alerta.mensaje }}</div>

    <div class="filtros-barra">
      <div class="campo-grupo">
        <label class="campo-etiqueta">Filtrar por grado</label>
        <select v-model="filtroGrado" class="campo-select">
          <option value="">Todos los grados</option>
          <option v-for="g in grados" :key="g.id_grado" :value="g.nombre">{{ g.nombre }}</option>
        </select>
      </div>
      <div class="filtro-resultado">
        <span class="resultado-count">{{ estudiantesFiltrados.length }}</span> estudiantes
      </div>
    </div>

    <div class="tarjeta tabla-card">
      <div v-if="cargando" class="cargando-centro"><span class="spinner spinner-grande"></span></div>

      <template v-else-if="estudiantesFiltrados.length">
        <div class="tabla-contenedor">
          <table class="tabla">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Fecha Nacimiento</th>
                <th>Sexo</th>
                <th>Padre / Tutor</th>
                <th>Grado</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="est in estudiantesFiltrados" :key="est.id_estudiante">
                <td>
                  <div class="celda-usuario">
                    <div class="avatar-sm avatar-ambar">{{ est.nombre_completo?.charAt(0)?.toUpperCase() }}</div>
                    <span class="celda-nombre">{{ est.nombre_completo }}</span>
                  </div>
                </td>
                <td>{{ formatearFecha(est.fecha_nacimiento) }}</td>
                <td>{{ est.sexo === 'M' ? 'Masculino' : est.sexo === 'F' ? 'Femenino' : '—' }}</td>
                <td>{{ obtenerPadre(est) }}</td>
                <td><span class="badge badge-primario">{{ obtenerGrado(est) }}</span></td>
                <td>
                  <span class="badge" :class="est.activo !== false ? 'badge-activo' : 'badge-inactivo'">
                    {{ est.activo !== false ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <div v-else class="vacio-estado">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--gris-300)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/>
        </svg>
        <p>{{ filtroGrado ? 'No hay estudiantes en este grado' : 'No hay estudiantes registrados' }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filtros-barra {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 16px;
}

.filtros-barra .campo-grupo {
  max-width: 240px;
}

.filtro-resultado {
  font-size: 0.8125rem;
  color: var(--gris-500);
  padding-bottom: 8px;
}

.resultado-count {
  font-weight: 700;
  color: var(--gris-800);
}

.tabla-card { padding: 0; }
.tabla-card .cargando-centro,
.tabla-card .vacio-estado { padding: 64px 24px; }

.vacio-estado {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--gris-400);
  font-size: 0.875rem;
}

.celda-usuario {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8125rem;
  flex-shrink: 0;
}

.avatar-ambar {
  background: #fffbeb;
  color: #92400e;
}

.badge-primario {
  background: var(--primario-claro);
  color: var(--primario);
}
</style>
