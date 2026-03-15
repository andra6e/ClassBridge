<script setup>
import { ref, onMounted, watch } from 'vue'
import maestroApi from '../api/maestro.api'
import Boton from '../components/ui/Boton.vue'
import InputCampo from '../components/ui/Input.vue'
import Modal from '../components/ui/Modal.vue'

const MATERIAS = [
  { id: 1, nombre: 'Español' },
  { id: 2, nombre: 'Inglés' },
  { id: 3, nombre: 'Matemáticas' },
  { id: 4, nombre: 'Ciencias' },
  { id: 5, nombre: 'Sociales' },
  { id: 6, nombre: 'Tecnología' },
  { id: 7, nombre: 'Educación Física' },
  { id: 8, nombre: 'Naturales' },
]

const miGrado = ref(null)
const fecha = ref(new Date().toISOString().slice(0, 10))
const contenidosDia = ref([])
const cargando = ref(false)
const guardando = ref(false)
const error = ref('')
const exito = ref('')

const modalVisible = ref(false)
const materiaSeleccionada = ref(null)
const formTema = ref('')
const formExplicacion = ref('')
const formActividades = ref('')
const formArchivo = ref(null)
const formError = ref('')
const tabContenido = ref('materia')

const contenidoGeneral = ref(null)

function materiasConEstado() {
  return MATERIAS.map((m) => {
    const registrado = contenidosDia.value.find((c) => c.tipo_contenido !== 'general' && c.id_materia === m.id)
    return { ...m, registrado: !!registrado, contenido: registrado || null }
  })
}

async function cargarDatos() {
  cargando.value = true
  error.value = ''
  exito.value = ''
  try {
    const resGrado = await maestroApi.obtenerMiGrado()
    miGrado.value = resGrado.data.data
    if (miGrado.value) await cargarContenido()
  } catch (err) {
    error.value = err.response?.data?.mensaje || 'Error al cargar datos'
  } finally {
    cargando.value = false
  }
}

async function cargarContenido() {
  try {
    const res = await maestroApi.listarContenido({
      id_grado: miGrado.value.id_grado,
      fecha: fecha.value,
    })
    contenidosDia.value = res.data.data || []
  } catch {
    contenidosDia.value = []
  }
}

function abrirModal(materia) {
  materiaSeleccionada.value = materia
  formError.value = ''
  exito.value = ''
  if (materia.contenido) {
    formTema.value = materia.contenido.tema || ''
    formExplicacion.value = materia.contenido.explicacion || ''
    formActividades.value = materia.contenido.actividades || ''
  } else {
    formTema.value = ''
    formExplicacion.value = ''
    formActividades.value = ''
  }
  formArchivo.value = null
  modalVisible.value = true
}

function abrirModalGeneral() {
  materiaSeleccionada.value = { id: null, nombre: 'General del día', tipo_contenido: 'general' }
  formError.value = ''
  exito.value = ''
  formTema.value = contenidoGeneral.value?.tema || ''
  formExplicacion.value = contenidoGeneral.value?.explicacion || ''
  formActividades.value = contenidoGeneral.value?.actividades || ''
  formArchivo.value = null
  modalVisible.value = true
}

function cerrarModal() {
  modalVisible.value = false
  materiaSeleccionada.value = null
}

async function guardarContenido() {
  if (!formTema.value.trim() || !formExplicacion.value.trim()) {
    formError.value = 'Tema y explicación son obligatorios'
    return
  }
  guardando.value = true
  formError.value = ''
  let archivo = undefined
  if (formArchivo.value) {
    const base64 = await convertirBase64(formArchivo.value)
    archivo = {
      nombre: formArchivo.value.name,
      mime: formArchivo.value.type || 'application/pdf',
      base64,
    }
  }

  const tipo = materiaSeleccionada.value?.tipo_contenido === 'general' ? 'general' : 'materia'

  try {
    await maestroApi.guardarContenido({
      id_grado: miGrado.value.id_grado,
      id_materia: tipo === 'materia' ? materiaSeleccionada.value.id : undefined,
      tipo_contenido: tipo,
      fecha: fecha.value,
      tema: formTema.value.trim(),
      explicacion: formExplicacion.value.trim(),
      actividades: formActividades.value.trim() || null,
      archivo,
    })
    exito.value = `Contenido de ${materiaSeleccionada.value.nombre} guardado`
    cerrarModal()
    await cargarContenido()
  } catch (err) {
    formError.value = err.response?.data?.mensaje || 'Error al guardar'
  } finally {
    guardando.value = false
  }
}

function convertirBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result || '')
      const sinPrefix = result.includes(',') ? result.split(',')[1] : result
      resolve(sinPrefix)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function cambiarArchivo(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (file.type !== 'application/pdf') {
    formError.value = 'Solo se permiten archivos PDF'
    return
  }
  formArchivo.value = file
}

watch(fecha, () => { if (miGrado.value) cargarContenido() })
watch(contenidosDia, () => {
  contenidoGeneral.value = contenidosDia.value.find((c) => c.tipo_contenido === 'general') || null
})
onMounted(cargarDatos)
</script>

<template>
  <div>
    <div class="cabecera-pagina">
      <div>
        <h1 class="titulo-pagina">Contenido de Clase</h1>
        <p class="subtitulo-pagina">Registra el tema visto en cada materia</p>
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
        <div class="tabs-barra">
          <button class="tab-btn" :class="{ activo: tabContenido === 'materia' }" @click="tabContenido = 'materia'">Por materia</button>
          <button class="tab-btn" :class="{ activo: tabContenido === 'general' }" @click="tabContenido = 'general'">General del día</button>
        </div>
        <div class="control-chips">
          <div class="control-chip">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/>
            </svg>
            <span>{{ miGrado.grado?.nombre || 'Grado' }}</span>
          </div>
          <div class="control-chip">
            <span class="chip-num">{{ materiasConEstado().filter(m => m.registrado).length }}</span>
            <span>/ {{ MATERIAS.length }} registradas</span>
          </div>
        </div>
        <div class="control-fecha">
          <label class="campo-etiqueta">Fecha</label>
          <input type="date" v-model="fecha" class="campo-select" />
        </div>
      </div>

      <div v-if="tabContenido === 'materia'" class="materias-grid">
        <button
          v-for="materia in materiasConEstado()"
          :key="materia.id"
          class="materia-card"
          :class="{ 'materia-registrada': materia.registrado }"
          @click="abrirModal(materia)"
        >
          <div class="materia-estado">
            <svg v-if="materia.registrado" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </div>
          <span class="materia-nombre">{{ materia.nombre }}</span>
          <span v-if="materia.contenido" class="materia-tema">{{ materia.contenido.tema }}</span>
          <span v-else class="materia-indicacion">Clic para registrar</span>
        </button>
      </div>

      <div v-else class="tarjeta contenido-general-card">
        <h3 class="seccion-titulo-sm">Resumen general del día</h3>
        <p v-if="contenidoGeneral" class="general-preview">{{ contenidoGeneral.tema }} · {{ contenidoGeneral.explicacion }}</p>
        <p v-else class="general-preview">Aún no hay resumen general registrado para esta fecha.</p>
        <Boton tamano="sm" @click="abrirModalGeneral">{{ contenidoGeneral ? 'Editar resumen' : 'Crear resumen' }}</Boton>
      </div>
    </div>

    <Modal :visible="modalVisible" :titulo="materiaSeleccionada?.nombre || 'Contenido'" @cerrar="cerrarModal">
      <form @submit.prevent="guardarContenido" class="form-modal">
        <div v-if="formError" class="alerta alerta-error">{{ formError }}</div>
        <InputCampo v-model="formTema" etiqueta="Tema" placeholder="Tema de la clase de hoy" />
        <div class="campo-grupo">
          <label class="campo-etiqueta">Explicación</label>
          <textarea v-model="formExplicacion" class="campo-textarea" placeholder="Descripción del contenido visto en clase" rows="4"></textarea>
        </div>
        <div class="campo-grupo">
          <label class="campo-etiqueta">Actividades (opcional)</label>
          <textarea v-model="formActividades" class="campo-textarea" placeholder="Actividades realizadas o tareas asignadas" rows="3"></textarea>
        </div>
        <div class="campo-grupo">
          <label class="campo-etiqueta">Adjuntar PDF (opcional)</label>
          <input type="file" accept="application/pdf" class="campo-select" @change="cambiarArchivo" />
          <small v-if="formArchivo">{{ formArchivo.name }}</small>
        </div>
        <div class="form-acciones">
          <Boton variante="secundario" type="button" @click="cerrarModal">Cancelar</Boton>
          <Boton :cargando="guardando" type="submit">Guardar</Boton>
        </div>
      </form>
    </Modal>
  </div>
</template>

<style scoped>
.controles-barra {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;
}

.tabs-barra {
  display: flex;
  gap: 8px;
}

.tab-btn {
  border: 1px solid var(--gris-200);
  background: white;
  color: var(--gris-600);
  border-radius: var(--radio-sm);
  padding: 6px 10px;
  font-size: 0.8125rem;
  font-weight: 600;
}

.tab-btn.activo {
  background: var(--primario-claro);
  color: var(--primario);
}

.contenido-general-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.general-preview {
  font-size: 0.875rem;
  color: var(--gris-600);
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

.control-fecha .campo-etiqueta {
  margin-bottom: 4px;
}

.materias-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.materia-card {
  background: white;
  border: 1px solid var(--gris-200);
  border-radius: var(--radio);
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all var(--transicion);
  text-align: center;
}

.materia-card:hover {
  border-color: var(--primario-200);
  box-shadow: var(--sombra-md);
}

.materia-registrada {
  border-color: #a7f3d0;
  background: #f0fdf4;
}

.materia-registrada:hover {
  border-color: var(--exito);
}

.materia-estado {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.materia-registrada .materia-estado {
  background: var(--exito-claro);
  color: var(--exito);
}

.materia-card:not(.materia-registrada) .materia-estado {
  color: var(--gris-300);
}

.materia-nombre {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--gris-800);
}

.materia-tema {
  font-size: 0.75rem;
  color: var(--gris-500);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.materia-indicacion {
  font-size: 0.75rem;
  color: var(--gris-400);
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
