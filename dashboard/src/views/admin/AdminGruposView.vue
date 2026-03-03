<script setup>
import { ref, onMounted } from 'vue'
import adminApi from '../../api/admin.api'
import Boton from '../../components/ui/Boton.vue'
import Modal from '../../components/ui/Modal.vue'

const grupos = ref([])
const maestros = ref([])
const cargando = ref(true)
const error = ref('')
const exito = ref('')

const modalCrear = ref(false)
const form = ref({ nombre: '', materia: '', nivel_grado: '', anio_escolar: '', id_maestro: '' })
const guardando = ref(false)

const modalAsignar = ref(false)
const grupoAsignar = ref(null)
const nuevoMaestro = ref('')
const asignando = ref(false)

async function cargar() {
  cargando.value = true
  try {
    const [g, m] = await Promise.all([adminApi.listarGrupos(), adminApi.listarMaestros()])
    grupos.value = g.data.data
    maestros.value = m.data.data
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'Error al cargar'
  } finally {
    cargando.value = false
  }
}

async function crear() {
  guardando.value = true; error.value = ''
  try {
    await adminApi.crearGrupo({ ...form.value, id_maestro: Number(form.value.id_maestro) })
    exito.value = 'Grupo creado'
    modalCrear.value = false
    form.value = { nombre: '', materia: '', nivel_grado: '', anio_escolar: '', id_maestro: '' }
    await cargar()
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'Error al crear grupo'
  } finally {
    guardando.value = false
  }
}

function abrirAsignar(g) {
  grupoAsignar.value = g
  nuevoMaestro.value = g.id_maestro
  modalAsignar.value = true
}

async function asignar() {
  asignando.value = true; error.value = ''
  try {
    await adminApi.asignarMaestro(grupoAsignar.value.id_grupo, Number(nuevoMaestro.value))
    exito.value = 'Maestro asignado'
    modalAsignar.value = false
    await cargar()
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'Error al asignar'
  } finally {
    asignando.value = false
  }
}

onMounted(cargar)
</script>

<template>
  <div class="contenedor-pagina">
    <div class="cabecera-flex">
      <h1 class="titulo-pagina">Grupos</h1>
      <Boton @click="modalCrear = true">Crear grupo</Boton>
    </div>

    <div v-if="exito" class="alerta alerta-exito">{{ exito }}</div>
    <div v-if="error" class="alerta alerta-error">{{ error }}</div>

    <div v-if="cargando" class="cargando-centro"><div class="spinner spinner-grande"></div></div>

    <div v-else class="tarjeta tabla-contenedor">
      <table class="tabla">
        <thead><tr><th>Nombre</th><th>Materia</th><th>Grado</th><th>Ciclo</th><th>Maestro</th><th>Acciones</th></tr></thead>
        <tbody>
          <tr v-for="g in grupos" :key="g.id_grupo">
            <td>{{ g.nombre }}</td>
            <td>{{ g.materia || '-' }}</td>
            <td>{{ g.nivel_grado || '-' }}</td>
            <td>{{ g.anio_escolar || '-' }}</td>
            <td>{{ g.maestro?.nombre_completo || '-' }}</td>
            <td><Boton variante="secundario" tamano="sm" @click="abrirAsignar(g)">Cambiar maestro</Boton></td>
          </tr>
        </tbody>
      </table>
      <div v-if="!grupos.length" class="mensaje-vacio">No hay grupos registrados.</div>
    </div>

    <Modal :visible="modalCrear" titulo="Crear grupo" @cerrar="modalCrear = false">
      <form class="form-modal" @submit.prevent="crear">
        <div class="campo"><label class="campo-etiqueta">Nombre</label><input v-model="form.nombre" class="campo-input" required /></div>
        <div class="campo"><label class="campo-etiqueta">Materia</label><input v-model="form.materia" class="campo-input" /></div>
        <div class="campo"><label class="campo-etiqueta">Grado</label><input v-model="form.nivel_grado" class="campo-input" /></div>
        <div class="campo"><label class="campo-etiqueta">Ciclo escolar</label><input v-model="form.anio_escolar" class="campo-input" /></div>
        <div class="campo">
          <label class="campo-etiqueta">Maestro</label>
          <select v-model="form.id_maestro" class="campo-input" required>
            <option value="" disabled>Seleccionar maestro</option>
            <option v-for="m in maestros" :key="m.id_usuario" :value="m.id_usuario">{{ m.nombre_completo }}</option>
          </select>
        </div>
        <Boton :cargando="guardando" style="margin-top:12px">Crear</Boton>
      </form>
    </Modal>

    <Modal :visible="modalAsignar" titulo="Asignar maestro" @cerrar="modalAsignar = false">
      <form class="form-modal" @submit.prevent="asignar">
        <p style="margin-bottom:12px;color:var(--gris-600);font-size:0.9rem;">Grupo: <strong>{{ grupoAsignar?.nombre }}</strong></p>
        <div class="campo">
          <label class="campo-etiqueta">Nuevo maestro</label>
          <select v-model="nuevoMaestro" class="campo-input" required>
            <option v-for="m in maestros" :key="m.id_usuario" :value="m.id_usuario">{{ m.nombre_completo }}</option>
          </select>
        </div>
        <Boton :cargando="asignando" style="margin-top:12px">Asignar</Boton>
      </form>
    </Modal>
  </div>
</template>

<style scoped>
.cabecera-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.tabla-contenedor { overflow-x: auto; }
.tabla { width: 100%; border-collapse: collapse; }
.tabla th { text-align: left; padding: 12px 16px; background: var(--gris-50); border-bottom: 2px solid var(--gris-200); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gris-500); font-weight: 600; }
.tabla td { padding: 12px 16px; border-bottom: 1px solid var(--gris-100); font-size: 0.9rem; }
.form-modal { display: flex; flex-direction: column; gap: 14px; }
.campo { display: flex; flex-direction: column; gap: 4px; }
.campo-etiqueta { font-size: 0.85rem; font-weight: 600; color: var(--gris-700); }
.campo-input { padding: 9px 12px; border: 1px solid var(--gris-300); border-radius: var(--radio); font-size: 0.9rem; outline: none; }
.campo-input:focus { border-color: var(--primario); box-shadow: 0 0 0 3px var(--primario-claro); }
</style>
