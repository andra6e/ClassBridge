<script setup>
import { ref, onMounted } from 'vue'
import justificantesApi from '../api/justificantes.api'
import Boton from '../components/ui/Boton.vue'
import Modal from '../components/ui/Modal.vue'

const justificantes = ref([])
const cargando = ref(true)
const error = ref('')
const exito = ref('')

const modalVisible = ref(false)
const justificanteActual = ref(null)
const notasRevision = ref('')
const procesando = ref(false)

onMounted(cargarJustificantes)

async function cargarJustificantes() {
  cargando.value = true
  error.value = ''
  try {
    const { data } = await justificantesApi.listarPendientes()
    justificantes.value = data.data
  } catch (err) {
    error.value = err.response?.data?.mensaje || 'Error al cargar justificantes'
  } finally {
    cargando.value = false
  }
}

function abrirModal(justificante) {
  justificanteActual.value = justificante
  notasRevision.value = ''
  modalVisible.value = true
}

function cerrarModal() {
  modalVisible.value = false
  justificanteActual.value = null
}

async function revisar(estado) {
  procesando.value = true
  exito.value = ''
  error.value = ''

  try {
    await justificantesApi.revisar(
      justificanteActual.value.id_justificante,
      estado,
      notasRevision.value.trim() || null
    )
    exito.value = `Justificante ${estado} correctamente`
    cerrarModal()
    await cargarJustificantes()
  } catch (err) {
    error.value = err.response?.data?.mensaje || 'Error al procesar justificante'
  } finally {
    procesando.value = false
  }
}

function formatearFecha(fecha) {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="contenedor-pagina">
    <h1 class="titulo-pagina">Justificantes pendientes</h1>

    <div v-if="exito" class="alerta alerta-exito">{{ exito }}</div>
    <div v-if="error && !cargando" class="alerta alerta-error">{{ error }}</div>

    <div v-if="cargando" class="cargando-centro">
      <div class="spinner spinner-grande"></div>
    </div>

    <div v-else-if="justificantes.length === 0" class="mensaje-vacio">
      No hay justificantes pendientes de revision.
    </div>

    <div v-else class="justificantes-lista">
      <div
        v-for="j in justificantes"
        :key="j.id_justificante"
        class="justificante-tarjeta tarjeta"
      >
        <div class="j-cabecera">
          <div>
            <h3 class="j-estudiante">{{ j.estudiante || 'Estudiante' }}</h3>
            <p class="j-fecha">{{ formatearFecha(j.creado_en) }}</p>
          </div>
          <span class="j-badge">Pendiente</span>
        </div>

        <div class="j-motivo">
          <strong>Motivo:</strong> {{ j.motivo }}
        </div>

        <div v-if="j.url_adjunto" class="j-adjunto">
          <a :href="j.url_adjunto" target="_blank" rel="noopener">Ver adjunto</a>
        </div>

        <div class="j-acciones">
          <Boton variante="exito" tamano="sm" @click="abrirModal(j)">
            Revisar
          </Boton>
        </div>
      </div>
    </div>

    <Modal :visible="modalVisible" titulo="Revisar justificante" @cerrar="cerrarModal">
      <div v-if="justificanteActual" class="modal-revisar">
        <p class="modal-info"><strong>Motivo:</strong> {{ justificanteActual.motivo }}</p>

        <div class="campo">
          <label class="campo-etiqueta" for="notas-rev">Notas de revision (opcional)</label>
          <textarea
            id="notas-rev"
            v-model="notasRevision"
            class="campo-textarea"
            placeholder="Observaciones sobre la revision..."
            rows="3"
          ></textarea>
        </div>

        <div class="modal-botones">
          <Boton
            variante="exito"
            tamano="md"
            :cargando="procesando"
            @click="revisar('aprobado')"
          >
            Aprobar
          </Boton>
          <Boton
            variante="peligro"
            tamano="md"
            :cargando="procesando"
            @click="revisar('rechazado')"
          >
            Rechazar
          </Boton>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.justificantes-lista {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.justificante-tarjeta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.j-cabecera {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.j-estudiante {
  font-size: 1rem;
  font-weight: 600;
}

.j-fecha {
  font-size: 0.8rem;
  color: var(--gris-400);
  margin-top: 2px;
}

.j-badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--advertencia-claro);
  color: var(--advertencia);
}

.j-motivo {
  font-size: 0.9rem;
  color: var(--gris-600);
  line-height: 1.5;
}

.j-adjunto a {
  color: var(--primario);
  font-size: 0.85rem;
  font-weight: 500;
}

.j-acciones {
  display: flex;
  gap: 8px;
}

.modal-revisar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-info {
  font-size: 0.9rem;
  color: var(--gris-600);
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.campo-etiqueta {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gris-700);
}

.campo-textarea {
  padding: 10px 14px;
  border: 1px solid var(--gris-300);
  border-radius: var(--radio);
  font-size: 0.95rem;
  outline: none;
  resize: vertical;
  min-height: 80px;
}

.campo-textarea:focus {
  border-color: var(--primario);
  box-shadow: 0 0 0 3px var(--primario-claro);
}

.modal-botones {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>
