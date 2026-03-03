<script setup>
import { ref, onMounted, watch } from 'vue'
import adminApi from '../../api/admin.api'
import Boton from '../../components/ui/Boton.vue'

const grupos = ref([])
const grupoSeleccionado = ref(null)
const inscritos = ref([])
const estudiantesBusqueda = ref([])
const busqueda = ref('')
const cargando = ref(true)
const cargandoInscritos = ref(false)
const error = ref('')
const exito = ref('')

async function cargarGrupos() {
  cargando.value = true
  try {
    const { data } = await adminApi.listarGrupos()
    grupos.value = data.data
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'Error al cargar grupos'
  } finally {
    cargando.value = false
  }
}

async function cargarInscritos() {
  if (!grupoSeleccionado.value) return
  cargandoInscritos.value = true; error.value = ''
  try {
    const { data } = await adminApi.listarInscritos(grupoSeleccionado.value)
    inscritos.value = data.data
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'Error'
  } finally {
    cargandoInscritos.value = false
  }
}

let timer = null
function buscarEstudiantes() {
  clearTimeout(timer)
  timer = setTimeout(async () => {
    if (!busqueda.value || busqueda.value.length < 2) { estudiantesBusqueda.value = []; return }
    try {
      const { data } = await adminApi.listarEstudiantes(busqueda.value)
      const idsInscritos = new Set(inscritos.value.map(i => i.estudiante?.id_estudiante || i.id_estudiante))
      estudiantesBusqueda.value = data.data.filter(e => !idsInscritos.has(e.id_estudiante))
    } catch (_) { /* silencioso */ }
  }, 400)
}

async function matricular(idEstudiante) {
  error.value = ''; exito.value = ''
  try {
    await adminApi.matricularEstudiante(grupoSeleccionado.value, idEstudiante)
    exito.value = 'Estudiante matriculado'
    busqueda.value = ''
    estudiantesBusqueda.value = []
    await cargarInscritos()
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'Error al matricular'
  }
}

async function retirar(idEstudiante) {
  error.value = ''; exito.value = ''
  try {
    await adminApi.retirarEstudiante(grupoSeleccionado.value, idEstudiante)
    exito.value = 'Estudiante retirado'
    await cargarInscritos()
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'Error al retirar'
  }
}

watch(grupoSeleccionado, () => {
  inscritos.value = []
  estudiantesBusqueda.value = []
  busqueda.value = ''
  cargarInscritos()
})

onMounted(cargarGrupos)
</script>

<template>
  <div class="contenedor-pagina">
    <h1 class="titulo-pagina">Matriculas</h1>

    <div v-if="exito" class="alerta alerta-exito">{{ exito }}</div>
    <div v-if="error" class="alerta alerta-error">{{ error }}</div>

    <div v-if="cargando" class="cargando-centro"><div class="spinner spinner-grande"></div></div>

    <template v-else>
      <div class="selector-grupo">
        <label class="campo-etiqueta">Seleccionar grupo</label>
        <select v-model="grupoSeleccionado" class="campo-input">
          <option :value="null" disabled>-- Elegir grupo --</option>
          <option v-for="g in grupos" :key="g.id_grupo" :value="g.id_grupo">
            {{ g.nombre }} {{ g.materia ? '- ' + g.materia : '' }}
          </option>
        </select>
      </div>

      <template v-if="grupoSeleccionado">
        <div class="seccion">
          <h2 class="subtitulo">Agregar estudiante</h2>
          <input v-model="busqueda" class="campo-input" placeholder="Buscar estudiante por nombre o matricula..." @input="buscarEstudiantes" />
          <div v-if="estudiantesBusqueda.length" class="resultados-busqueda">
            <div v-for="e in estudiantesBusqueda" :key="e.id_estudiante" class="resultado-item">
              <span>{{ e.nombre_completo }} <small>{{ e.codigo_matricula || '' }}</small></span>
              <Boton variante="exito" tamano="sm" @click="matricular(e.id_estudiante)">Matricular</Boton>
            </div>
          </div>
        </div>

        <div class="seccion">
          <h2 class="subtitulo">Estudiantes inscritos</h2>
          <div v-if="cargandoInscritos" class="cargando-centro"><div class="spinner"></div></div>
          <div v-else-if="!inscritos.length" class="mensaje-vacio">No hay estudiantes inscritos en este grupo.</div>
          <div v-else class="tarjeta tabla-contenedor">
            <table class="tabla">
              <thead><tr><th>Nombre</th><th>Matricula</th><th>Grado</th><th>Acciones</th></tr></thead>
              <tbody>
                <tr v-for="i in inscritos" :key="i.estudiante?.id_estudiante">
                  <td>{{ i.estudiante?.nombre_completo }}</td>
                  <td>{{ i.estudiante?.codigo_matricula || '-' }}</td>
                  <td>{{ i.estudiante?.nivel_grado || '-' }}</td>
                  <td><Boton variante="peligro" tamano="sm" @click="retirar(i.estudiante?.id_estudiante)">Retirar</Boton></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.selector-grupo { margin-bottom: 24px; max-width: 400px; }
.seccion { margin-bottom: 24px; }
.subtitulo { font-size: 1.1rem; font-weight: 600; color: var(--gris-800); margin-bottom: 12px; }
.resultados-busqueda { margin-top: 8px; background: white; border: 1px solid var(--gris-200); border-radius: var(--radio); max-height: 240px; overflow-y: auto; }
.resultado-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid var(--gris-100); }
.resultado-item:last-child { border-bottom: none; }
.resultado-item small { color: var(--gris-400); margin-left: 6px; }
.tabla-contenedor { overflow-x: auto; }
.tabla { width: 100%; border-collapse: collapse; }
.tabla th { text-align: left; padding: 12px 16px; background: var(--gris-50); border-bottom: 2px solid var(--gris-200); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gris-500); font-weight: 600; }
.tabla td { padding: 12px 16px; border-bottom: 1px solid var(--gris-100); font-size: 0.9rem; }
.campo-etiqueta { font-size: 0.85rem; font-weight: 600; color: var(--gris-700); display: block; margin-bottom: 4px; }
.campo-input { padding: 9px 12px; border: 1px solid var(--gris-300); border-radius: var(--radio); font-size: 0.9rem; outline: none; width: 100%; }
.campo-input:focus { border-color: var(--primario); box-shadow: 0 0 0 3px var(--primario-claro); }
</style>
