<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import adminApi from '../../api/admin.api'
import Boton from '../../components/ui/Boton.vue'
import Input from '../../components/ui/Input.vue'
import Modal from '../../components/ui/Modal.vue'

const estudiantes = ref([])
const grados = ref([])
const padres = ref([])
const cargando = ref(true)
const alerta = ref({ tipo: '', mensaje: '' })

const filtroGrado = ref('')
const filtroPadre = ref('')
const filtroEstado = ref('')

const modalEditar = ref(false)
const guardando = ref(false)
const seleccionado = ref(null)
const form = ref({ nombre_completo: '', fecha_nacimiento: '', sexo: '', activo: true })

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

async function cargarEstudiantes() {
  cargando.value = true
  // allSettled evita que un fallo en padres/grados vacíe la tabla principal
  const [eRes, gRes, pRes] = await Promise.allSettled([
    adminApi.listarEstudiantes({
      id_grado: filtroGrado.value || undefined,
      id_padre: filtroPadre.value || undefined,
      estado: filtroEstado.value || undefined,
    }),
    adminApi.listarGrados(),
    adminApi.listarPadres(),
  ])
  if (eRes.status === 'fulfilled') {
    estudiantes.value = eRes.value.data.data || []
  } else {
    mostrarAlerta('error', 'Error al cargar estudiantes')
  }
  if (gRes.status === 'fulfilled') grados.value = gRes.value.data.data || []
  if (pRes.status === 'fulfilled') padres.value = pRes.value.data.data || []
  cargando.value = false
}

function abrirEditar(est) {
  seleccionado.value = est
  form.value = {
    nombre_completo: est.nombre_completo || '',
    fecha_nacimiento: est.fecha_nacimiento || '',
    sexo: est.sexo || '',
    activo: est.activo !== false,
  }
  modalEditar.value = true
}

async function guardarEdicion() {
  if (!seleccionado.value) return
  guardando.value = true
  try {
    await adminApi.actualizarEstudiante(seleccionado.value.id_estudiante, {
      nombre_completo: form.value.nombre_completo,
      fecha_nacimiento: form.value.fecha_nacimiento || '',
      sexo: form.value.sexo || '',
      activo: form.value.activo,
    })
    modalEditar.value = false
    mostrarAlerta('exito', 'Estudiante actualizado')
    await cargarEstudiantes()
  } catch (err) {
    mostrarAlerta('error', err.response?.data?.mensaje || 'Error al actualizar estudiante')
  }
  guardando.value = false
}

const estudiantesFiltrados = computed(() => estudiantes.value)

watch([filtroGrado, filtroPadre, filtroEstado], () => cargarEstudiantes())
onMounted(cargarEstudiantes)
</script>

<template>
  <div>
    <div class="cabecera-pagina">
      <div>
        <h1 class="titulo-pagina">Estudiantes</h1>
        <p class="subtitulo-pagina">Filtra por grado, padre y estado. Edita datos y estado del estudiante.</p>
      </div>
    </div>

    <div v-if="alerta.mensaje" class="alerta" :class="`alerta-${alerta.tipo}`">{{ alerta.mensaje }}</div>

    <div class="filtros-barra">
      <div class="campo-grupo">
        <label class="campo-etiqueta">Grado</label>
        <select v-model="filtroGrado" class="campo-select">
          <option value="">Todos</option>
          <option v-for="g in grados" :key="g.id_grado" :value="g.id_grado">{{ g.nombre }}</option>
        </select>
      </div>
      <div class="campo-grupo">
        <label class="campo-etiqueta">Padre</label>
        <select v-model="filtroPadre" class="campo-select">
          <option value="">Todos</option>
          <option v-for="p in padres" :key="p.id_usuario" :value="p.id_usuario">{{ p.nombre_completo }}</option>
        </select>
      </div>
      <div class="campo-grupo">
        <label class="campo-etiqueta">Estado</label>
        <select v-model="filtroEstado" class="campo-select">
          <option value="">Todos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
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
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="est in estudiantesFiltrados" :key="est.id_estudiante">
                <td class="celda-nombre">{{ est.nombre_completo }}</td>
                <td>{{ formatearFecha(est.fecha_nacimiento) }}</td>
                <td>{{ est.sexo === 'M' ? 'Masculino' : est.sexo === 'F' ? 'Femenino' : '—' }}</td>
                <td>{{ obtenerPadre(est) }}</td>
                <td><span class="badge badge-primario">{{ obtenerGrado(est) }}</span></td>
                <td>
                  <span class="badge" :class="est.activo !== false ? 'badge-activo' : 'badge-inactivo'">
                    {{ est.activo !== false ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td>
                  <Boton tamano="sm" @click="abrirEditar(est)">Editar</Boton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <div v-else class="vacio-estado">
        <p>No hay estudiantes con los filtros actuales.</p>
      </div>
    </div>

    <Modal :visible="modalEditar" titulo="Editar estudiante" @cerrar="modalEditar = false">
      <form @submit.prevent="guardarEdicion" class="form-modal">
        <Input v-model="form.nombre_completo" etiqueta="Nombre" />
        <Input v-model="form.fecha_nacimiento" etiqueta="Fecha de nacimiento" tipo="date" />
        <div class="campo-grupo">
          <label class="campo-etiqueta">Sexo</label>
          <select v-model="form.sexo" class="campo-select">
            <option value="">—</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
        </div>
        <div class="campo-grupo">
          <label class="campo-etiqueta">Estado</label>
          <select v-model="form.activo" class="campo-select">
            <option :value="true">Activo</option>
            <option :value="false">Inactivo</option>
          </select>
        </div>
        <div class="form-acciones">
          <Boton variante="secundario" type="button" @click="modalEditar = false">Cancelar</Boton>
          <Boton type="submit" :cargando="guardando">Guardar</Boton>
        </div>
      </form>
    </Modal>
  </div>
</template>

<style scoped>
.filtros-barra {
  display: grid;
  grid-template-columns: repeat(3, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.tabla-card { padding: 0; }
.badge-primario { background: var(--primario-claro); color: var(--primario); }
</style>
