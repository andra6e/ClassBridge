<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import adminApi from '../../api/admin.api'
import Boton from '../../components/ui/Boton.vue'
import Input from '../../components/ui/Input.vue'
import Modal from '../../components/ui/Modal.vue'

const matriculas = ref([])
const grados = ref([])
const padres = ref([])
const estudiantes = ref([])
const cargando = ref(true)
const alerta = ref({ tipo: '', mensaje: '' })

const filtroAnio = ref('2025-2026')
const filtroEstado = ref('')
const filtroGrado = ref('')
const filtroTexto = ref('')

const modalDetalle = ref(false)
const modalEditar = ref(false)
const guardando = ref(false)
const seleccionado = ref(null)
const form = ref({ id_padre: '', id_estudiante: '', id_grado: '', anio_escolar: '', estado: 'activa' })

function mostrarAlerta(tipo, mensaje) {
  alerta.value = { tipo, mensaje }
  setTimeout(() => { alerta.value = { tipo: '', mensaje: '' } }, 4000)
}

function padreNombre(mat) {
  return mat.padre?.nombre_completo || mat.Padre?.nombre_completo || '—'
}

function estudianteNombre(mat) {
  return mat.estudiante?.nombre_completo || mat.Estudiante?.nombre_completo || '—'
}

function gradoNombre(mat) {
  return mat.grado?.nombre || mat.Grado?.nombre || '—'
}

async function cargarCatalogos() {
  try {
    const [gRes, pRes, eRes] = await Promise.all([
      adminApi.listarGrados(),
      adminApi.listarPadres(),
      adminApi.listarEstudiantes(),
    ])
    grados.value = gRes.data.data || []
    padres.value = pRes.data.data || []
    estudiantes.value = eRes.data.data || []
  } catch {
    // ignore
  }
}

async function cargarMatriculas() {
  cargando.value = true
  try {
    const res = await adminApi.listarMatriculas({ anio_escolar: filtroAnio.value || undefined })
    matriculas.value = res.data.data || []
  } catch {
    mostrarAlerta('error', 'Error al cargar matrículas')
  }
  cargando.value = false
}

const matriculasFiltradas = computed(() => {
  return matriculas.value.filter((m) => {
    if (filtroEstado.value && m.estado !== filtroEstado.value) return false
    if (filtroGrado.value && String(m.id_grado) !== String(filtroGrado.value)) return false
    if (filtroTexto.value) {
      const txt = filtroTexto.value.toLowerCase()
      const match = padreNombre(m).toLowerCase().includes(txt)
        || estudianteNombre(m).toLowerCase().includes(txt)
      if (!match) return false
    }
    return true
  })
})

async function verMatricula(id) {
  try {
    const res = await adminApi.obtenerMatricula(id)
    seleccionado.value = res.data.data || res.data
    modalDetalle.value = true
  } catch {
    mostrarAlerta('error', 'No se pudo cargar el detalle')
  }
}

function abrirEditar(m) {
  seleccionado.value = m
  form.value = {
    id_padre: m.id_padre,
    id_estudiante: m.id_estudiante,
    id_grado: m.id_grado,
    anio_escolar: m.anio_escolar,
    estado: m.estado || 'activa',
  }
  modalEditar.value = true
}

async function guardarEdicion() {
  if (!seleccionado.value) return
  guardando.value = true
  try {
    await adminApi.actualizarMatricula(seleccionado.value.id_matricula, {
      id_padre: Number(form.value.id_padre),
      id_estudiante: Number(form.value.id_estudiante),
      id_grado: Number(form.value.id_grado),
      anio_escolar: form.value.anio_escolar,
      estado: form.value.estado,
    })
    modalEditar.value = false
    mostrarAlerta('exito', 'Matrícula actualizada')
    await cargarMatriculas()
  } catch (err) {
    mostrarAlerta('error', err.response?.data?.mensaje || 'Error al actualizar matrícula')
  }
  guardando.value = false
}

async function eliminarMatricula(m) {
  if (!confirm(`¿Eliminar matrícula de ${estudianteNombre(m)}?`)) return
  try {
    await adminApi.eliminarMatricula(m.id_matricula)
    mostrarAlerta('exito', 'Matrícula eliminada')
    await cargarMatriculas()
  } catch (err) {
    mostrarAlerta('error', err.response?.data?.mensaje || 'Error al eliminar matrícula')
  }
}

watch(filtroAnio, () => cargarMatriculas())
onMounted(async () => {
  await Promise.all([cargarCatalogos(), cargarMatriculas()])
})
</script>

<template>
  <div>
    <div class="cabecera-pagina">
      <div>
        <h1 class="titulo-pagina">Matrículas</h1>
        <p class="subtitulo-pagina">Abre cada matrícula para ver contenido, filtrar, editar y eliminar.</p>
      </div>
    </div>

    <div v-if="alerta.mensaje" class="alerta" :class="`alerta-${alerta.tipo}`">{{ alerta.mensaje }}</div>

    <div class="filtros-barra">
      <Input v-model="filtroAnio" etiqueta="Año escolar" placeholder="2025-2026" />
      <div class="campo-grupo">
        <label class="campo-etiqueta">Estado</label>
        <select v-model="filtroEstado" class="campo-select">
          <option value="">Todos</option>
          <option value="activa">Activa</option>
          <option value="retirada">Retirada</option>
          <option value="graduada">Graduada</option>
        </select>
      </div>
      <div class="campo-grupo">
        <label class="campo-etiqueta">Grado</label>
        <select v-model="filtroGrado" class="campo-select">
          <option value="">Todos</option>
          <option v-for="g in grados" :key="g.id_grado" :value="g.id_grado">{{ g.nombre }}</option>
        </select>
      </div>
      <Input v-model="filtroTexto" etiqueta="Buscar" placeholder="Padre o estudiante" />
    </div>

    <div class="tarjeta tabla-card">
      <div v-if="cargando" class="cargando-centro"><span class="spinner spinner-grande"></span></div>

      <template v-else-if="matriculasFiltradas.length">
        <div class="tabla-contenedor">
          <table class="tabla">
            <thead>
              <tr>
                <th>Padre / Tutor</th>
                <th>Estudiante</th>
                <th>Grado</th>
                <th>Año Escolar</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="mat in matriculasFiltradas" :key="mat.id_matricula">
                <td>{{ padreNombre(mat) }}</td>
                <td class="celda-nombre">{{ estudianteNombre(mat) }}</td>
                <td><span class="badge badge-primario">{{ gradoNombre(mat) }}</span></td>
                <td>{{ mat.anio_escolar }}</td>
                <td>
                  <span class="badge" :class="mat.estado === 'activa' ? 'badge-activo' : 'badge-inactivo'">
                    {{ mat.estado || 'activa' }}
                  </span>
                </td>
                <td class="acciones-tabla">
                  <Boton tamano="sm" variante="secundario" @click="verMatricula(mat.id_matricula)">Ver</Boton>
                  <Boton tamano="sm" @click="abrirEditar(mat)">Editar</Boton>
                  <Boton tamano="sm" variante="fantasma" @click="eliminarMatricula(mat)">Eliminar</Boton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <div v-else class="vacio-estado">
        <p>No hay matrículas para los filtros seleccionados.</p>
      </div>
    </div>

    <Modal :visible="modalDetalle" titulo="Detalle de matrícula" @cerrar="modalDetalle = false">
      <div v-if="seleccionado" class="detalle-grid">
        <div><strong>ID:</strong> {{ seleccionado.id_matricula }}</div>
        <div><strong>Padre:</strong> {{ padreNombre(seleccionado) }}</div>
        <div><strong>Estudiante:</strong> {{ estudianteNombre(seleccionado) }}</div>
        <div><strong>Grado:</strong> {{ gradoNombre(seleccionado) }}</div>
        <div><strong>Año:</strong> {{ seleccionado.anio_escolar }}</div>
        <div><strong>Estado:</strong> {{ seleccionado.estado }}</div>
      </div>
    </Modal>

    <Modal :visible="modalEditar" titulo="Editar matrícula" @cerrar="modalEditar = false">
      <form @submit.prevent="guardarEdicion" class="form-modal">
        <div class="campo-grupo">
          <label class="campo-etiqueta">Padre</label>
          <select v-model="form.id_padre" class="campo-select">
            <option v-for="p in padres" :key="p.id_usuario" :value="p.id_usuario">{{ p.nombre_completo }}</option>
          </select>
        </div>
        <div class="campo-grupo">
          <label class="campo-etiqueta">Estudiante</label>
          <select v-model="form.id_estudiante" class="campo-select">
            <option v-for="e in estudiantes" :key="e.id_estudiante" :value="e.id_estudiante">{{ e.nombre_completo }}</option>
          </select>
        </div>
        <div class="campo-grupo">
          <label class="campo-etiqueta">Grado</label>
          <select v-model="form.id_grado" class="campo-select">
            <option v-for="g in grados" :key="g.id_grado" :value="g.id_grado">{{ g.nombre }}</option>
          </select>
        </div>
        <Input v-model="form.anio_escolar" etiqueta="Año escolar" />
        <div class="campo-grupo">
          <label class="campo-etiqueta">Estado</label>
          <select v-model="form.estado" class="campo-select">
            <option value="activa">Activa</option>
            <option value="retirada">Retirada</option>
            <option value="graduada">Graduada</option>
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
  grid-template-columns: repeat(4, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.tabla-card { padding: 0; }
.badge-primario { background: var(--primario-claro); color: var(--primario); }
.acciones-tabla { display: flex; gap: 6px; flex-wrap: wrap; }
.detalle-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
</style>
