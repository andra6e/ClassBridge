<script setup>
import { ref, onMounted } from 'vue'
import adminApi from '../../api/admin.api'
import Boton from '../../components/ui/Boton.vue'
import Modal from '../../components/ui/Modal.vue'

const estudiantes = ref([])
const cargando = ref(true)
const error = ref('')
const exito = ref('')
const busqueda = ref('')

const modalVisible = ref(false)
const form = ref({ nombre_completo: '', codigo_matricula: '', fecha_nacimiento: '', sexo: '', nivel_grado: '' })
const guardando = ref(false)

async function cargar() {
  cargando.value = true; error.value = ''
  try {
    const { data } = await adminApi.listarEstudiantes(busqueda.value || undefined)
    estudiantes.value = data.data
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'Error al cargar'
  } finally {
    cargando.value = false
  }
}

async function crear() {
  guardando.value = true; error.value = ''
  try {
    const datos = { ...form.value }
    if (!datos.sexo) delete datos.sexo
    if (!datos.fecha_nacimiento) delete datos.fecha_nacimiento
    await adminApi.crearEstudiante(datos)
    exito.value = 'Estudiante creado'
    modalVisible.value = false
    form.value = { nombre_completo: '', codigo_matricula: '', fecha_nacimiento: '', sexo: '', nivel_grado: '' }
    await cargar()
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'Error al crear'
  } finally {
    guardando.value = false
  }
}

async function toggleEstado(est) {
  try {
    await adminApi.cambiarEstadoEstudiante(est.id_estudiante, !est.activo)
    est.activo = !est.activo
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'Error'
  }
}

let timer = null
function buscar() {
  clearTimeout(timer)
  timer = setTimeout(cargar, 400)
}

onMounted(cargar)
</script>

<template>
  <div class="contenedor-pagina">
    <div class="cabecera-flex">
      <h1 class="titulo-pagina">Estudiantes</h1>
      <Boton @click="modalVisible = true">Crear estudiante</Boton>
    </div>

    <div class="barra-busqueda">
      <input v-model="busqueda" class="campo-input" placeholder="Buscar por nombre o matricula..." @input="buscar" />
    </div>

    <div v-if="exito" class="alerta alerta-exito">{{ exito }}</div>
    <div v-if="error" class="alerta alerta-error">{{ error }}</div>

    <div v-if="cargando" class="cargando-centro"><div class="spinner spinner-grande"></div></div>

    <div v-else class="tarjeta tabla-contenedor">
      <table class="tabla">
        <thead><tr><th>Nombre</th><th>Matricula</th><th>Grado</th><th>Sexo</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          <tr v-for="e in estudiantes" :key="e.id_estudiante">
            <td>{{ e.nombre_completo }}</td>
            <td>{{ e.codigo_matricula || '-' }}</td>
            <td>{{ e.nivel_grado || '-' }}</td>
            <td>{{ e.sexo || '-' }}</td>
            <td><span class="badge" :class="e.activo ? 'badge-activo' : 'badge-inactivo'">{{ e.activo ? 'Activo' : 'Inactivo' }}</span></td>
            <td><Boton :variante="e.activo ? 'peligro' : 'exito'" tamano="sm" @click="toggleEstado(e)">{{ e.activo ? 'Desactivar' : 'Activar' }}</Boton></td>
          </tr>
        </tbody>
      </table>
      <div v-if="!estudiantes.length" class="mensaje-vacio">No hay estudiantes.</div>
    </div>

    <Modal :visible="modalVisible" titulo="Crear estudiante" @cerrar="modalVisible = false">
      <form class="form-modal" @submit.prevent="crear">
        <div class="campo"><label class="campo-etiqueta">Nombre completo</label><input v-model="form.nombre_completo" class="campo-input" required /></div>
        <div class="campo"><label class="campo-etiqueta">Matricula (opcional)</label><input v-model="form.codigo_matricula" class="campo-input" /></div>
        <div class="campo"><label class="campo-etiqueta">Fecha nacimiento</label><input v-model="form.fecha_nacimiento" type="date" class="campo-input" /></div>
        <div class="campo">
          <label class="campo-etiqueta">Sexo</label>
          <select v-model="form.sexo" class="campo-input">
            <option value="">Sin especificar</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
        </div>
        <div class="campo"><label class="campo-etiqueta">Grado</label><input v-model="form.nivel_grado" class="campo-input" /></div>
        <Boton :cargando="guardando" style="margin-top:12px">Crear</Boton>
      </form>
    </Modal>
  </div>
</template>

<style scoped>
.cabecera-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.barra-busqueda { margin-bottom: 16px; }
.tabla-contenedor { overflow-x: auto; }
.tabla { width: 100%; border-collapse: collapse; }
.tabla th { text-align: left; padding: 12px 16px; background: var(--gris-50); border-bottom: 2px solid var(--gris-200); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gris-500); font-weight: 600; }
.tabla td { padding: 12px 16px; border-bottom: 1px solid var(--gris-100); font-size: 0.9rem; }
.badge { padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
.badge-activo { background: var(--exito-claro); color: var(--exito); }
.badge-inactivo { background: var(--gris-100); color: var(--gris-500); }
.form-modal { display: flex; flex-direction: column; gap: 14px; }
.campo { display: flex; flex-direction: column; gap: 4px; }
.campo-etiqueta { font-size: 0.85rem; font-weight: 600; color: var(--gris-700); }
.campo-input { padding: 9px 12px; border: 1px solid var(--gris-300); border-radius: var(--radio); font-size: 0.9rem; outline: none; width: 100%; }
.campo-input:focus { border-color: var(--primario); box-shadow: 0 0 0 3px var(--primario-claro); }
</style>
