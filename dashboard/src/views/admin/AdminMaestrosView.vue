<script setup>
import { ref, onMounted } from 'vue'
import adminApi from '../../api/admin.api'
import Boton from '../../components/ui/Boton.vue'
import Modal from '../../components/ui/Modal.vue'

const maestros = ref([])
const cargando = ref(true)
const error = ref('')
const exito = ref('')

const modalVisible = ref(false)
const form = ref({ nombre_completo: '', correo: '', contrasena: '', telefono: '' })
const guardando = ref(false)

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    const { data } = await adminApi.listarMaestros()
    maestros.value = data.data
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'Error al cargar maestros'
  } finally {
    cargando.value = false
  }
}

async function crear() {
  guardando.value = true
  error.value = ''
  try {
    await adminApi.crearMaestro(form.value)
    exito.value = 'Maestro creado'
    modalVisible.value = false
    form.value = { nombre_completo: '', correo: '', contrasena: '', telefono: '' }
    await cargar()
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'Error al crear maestro'
  } finally {
    guardando.value = false
  }
}

async function toggleEstado(m) {
  try {
    await adminApi.cambiarEstadoMaestro(m.id_usuario, !m.activo)
    m.activo = !m.activo
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'Error al cambiar estado'
  }
}

onMounted(cargar)
</script>

<template>
  <div class="contenedor-pagina">
    <div class="cabecera-flex">
      <h1 class="titulo-pagina">Maestros</h1>
      <Boton @click="modalVisible = true">Crear maestro</Boton>
    </div>

    <div v-if="exito" class="alerta alerta-exito">{{ exito }}</div>
    <div v-if="error" class="alerta alerta-error">{{ error }}</div>

    <div v-if="cargando" class="cargando-centro"><div class="spinner spinner-grande"></div></div>

    <div v-else class="tarjeta tabla-contenedor">
      <table class="tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Telefono</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in maestros" :key="m.id_usuario">
            <td>{{ m.nombre_completo }}</td>
            <td>{{ m.correo }}</td>
            <td>{{ m.telefono || '-' }}</td>
            <td>
              <span class="badge" :class="m.activo ? 'badge-activo' : 'badge-inactivo'">
                {{ m.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td>
              <Boton :variante="m.activo ? 'peligro' : 'exito'" tamano="sm" @click="toggleEstado(m)">
                {{ m.activo ? 'Desactivar' : 'Activar' }}
              </Boton>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!maestros.length" class="mensaje-vacio">No hay maestros registrados.</div>
    </div>

    <Modal :visible="modalVisible" titulo="Crear maestro" @cerrar="modalVisible = false">
      <form class="form-modal" @submit.prevent="crear">
        <div class="campo"><label class="campo-etiqueta">Nombre completo</label><input v-model="form.nombre_completo" class="campo-input" required /></div>
        <div class="campo"><label class="campo-etiqueta">Correo</label><input v-model="form.correo" type="email" class="campo-input" required /></div>
        <div class="campo"><label class="campo-etiqueta">Contrasena</label><input v-model="form.contrasena" type="password" class="campo-input" required minlength="6" /></div>
        <div class="campo"><label class="campo-etiqueta">Telefono (opcional)</label><input v-model="form.telefono" class="campo-input" /></div>
        <Boton :cargando="guardando" style="margin-top:12px">Crear</Boton>
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
.badge { padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
.badge-activo { background: var(--exito-claro); color: var(--exito); }
.badge-inactivo { background: var(--gris-100); color: var(--gris-500); }
.form-modal { display: flex; flex-direction: column; gap: 14px; }
.campo { display: flex; flex-direction: column; gap: 4px; }
.campo-etiqueta { font-size: 0.85rem; font-weight: 600; color: var(--gris-700); }
.campo-input { padding: 9px 12px; border: 1px solid var(--gris-300); border-radius: var(--radio); font-size: 0.9rem; outline: none; }
.campo-input:focus { border-color: var(--primario); box-shadow: 0 0 0 3px var(--primario-claro); }
</style>
