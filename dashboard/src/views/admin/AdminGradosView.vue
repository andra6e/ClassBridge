<script setup>
import { ref, onMounted } from 'vue'
import adminApi from '../../api/admin.api'
import Boton from '../../components/ui/Boton.vue'
import Modal from '../../components/ui/Modal.vue'

const grados = ref([])
const maestros = ref([])
const cargando = ref(true)
const alerta = ref({ tipo: '', mensaje: '' })

const modalAsignar = ref(false)
const gradoSeleccionado = ref(null)
const maestroSeleccionado = ref('')
const anioEscolar = ref('2025-2026')
const guardandoAsignacion = ref(false)

const modalPromocion = ref(false)
const gradoPromocion = ref(null)
const anioPromocion = ref('2025-2026')
const promoviendoGrado = ref(false)

function mostrarAlerta(tipo, mensaje) {
  alerta.value = { tipo, mensaje }
  setTimeout(() => { alerta.value = { tipo: '', mensaje: '' } }, 4000)
}

function obtenerAsignacion(grado) {
  const asignaciones = grado.asignaciones || grado.AsignacionGrados
  if (asignaciones?.length) return asignaciones[asignaciones.length - 1]
  return null
}

function obtenerMaestroNombre(grado) {
  const asig = obtenerAsignacion(grado)
  const maestro = asig?.maestro || asig?.Maestro
  return maestro?.nombre_completo || null
}

function abrirModalAsignar(grado) {
  gradoSeleccionado.value = grado
  maestroSeleccionado.value = ''
  modalAsignar.value = true
}

function abrirModalPromocion(grado) {
  gradoPromocion.value = grado
  modalPromocion.value = true
}

async function cargarDatos() {
  cargando.value = true
  try {
    const [gRes, mRes] = await Promise.all([
      adminApi.listarGrados(),
      adminApi.listarMaestros(),
    ])
    grados.value = gRes.data.data || []
    maestros.value = (mRes.data.data || []).filter(m => m.activo !== false)
  } catch {
    mostrarAlerta('error', 'Error al cargar datos')
  }
  cargando.value = false
}

async function crearAsignacion() {
  if (!maestroSeleccionado.value) return
  guardandoAsignacion.value = true
  try {
    await adminApi.crearAsignacion({
      id_maestro: Number(maestroSeleccionado.value),
      id_grado: gradoSeleccionado.value.id_grado,
      anio_escolar: anioEscolar.value,
    })
    modalAsignar.value = false
    mostrarAlerta('exito', 'Maestro asignado correctamente')
    await cargarDatos()
  } catch (err) {
    mostrarAlerta('error', err.response?.data?.mensaje || 'Error al asignar maestro')
  }
  guardandoAsignacion.value = false
}

async function quitarAsignacion(grado) {
  const asig = obtenerAsignacion(grado)
  if (!asig || !confirm(`¿Quitar la asignación del maestro en ${grado.nombre}?`)) return
  try {
    await adminApi.eliminarAsignacion(asig.id_asignacion)
    mostrarAlerta('exito', 'Asignación eliminada')
    await cargarDatos()
  } catch {
    mostrarAlerta('error', 'Error al eliminar asignación')
  }
}

async function promoverGrado() {
  if (!gradoPromocion.value) return
  promoviendoGrado.value = true
  try {
    await adminApi.promocionGrado({
      id_grado: gradoPromocion.value.id_grado,
      anio_escolar: anioPromocion.value,
    })
    modalPromocion.value = false
    mostrarAlerta('exito', `Estudiantes de ${gradoPromocion.value.nombre} promovidos`)
    await cargarDatos()
  } catch (err) {
    mostrarAlerta('error', err.response?.data?.mensaje || 'Error al promover grado')
  }
  promoviendoGrado.value = false
}

onMounted(cargarDatos)
</script>

<template>
  <div>
    <div class="cabecera-pagina">
      <div>
        <h1 class="titulo-pagina">Grados y Asignaciones</h1>
        <p class="subtitulo-pagina">Gestiona grados escolares y asigna maestros</p>
      </div>
    </div>

    <div v-if="alerta.mensaje" class="alerta" :class="`alerta-${alerta.tipo}`">{{ alerta.mensaje }}</div>

    <div v-if="cargando" class="cargando-centro"><span class="spinner spinner-grande"></span></div>

    <template v-else>
      <div class="grados-grid">
        <div v-for="g in grados" :key="g.id_grado" class="grado-card">
          <div class="grado-top">
            <div class="grado-icono">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/>
              </svg>
            </div>
            <span class="grado-anio-badge">{{ anioEscolar }}</span>
          </div>
          <h3 class="grado-nombre">{{ g.nombre }}</h3>
          <div class="grado-maestro">
            <template v-if="obtenerMaestroNombre(g)">
              <div class="maestro-info">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                </svg>
                <span>{{ obtenerMaestroNombre(g) }}</span>
              </div>
            </template>
            <span v-else class="sin-maestro">Sin maestro asignado</span>
          </div>
          <div class="grado-acciones">
            <Boton v-if="!obtenerAsignacion(g)" tamano="sm" @click="abrirModalAsignar(g)">Asignar</Boton>
            <Boton v-else variante="fantasma" tamano="sm" @click="quitarAsignacion(g)">Quitar</Boton>
          </div>
        </div>
      </div>

      <div class="seccion-promocion tarjeta">
        <div class="promocion-cabecera">
          <div>
            <h2 class="seccion-titulo-sm">Promoción de Grado</h2>
            <p class="seccion-desc">Promueve a todos los estudiantes de un grado al siguiente nivel.</p>
          </div>
          <div class="campo-grupo" style="max-width: 180px;">
            <label class="campo-etiqueta">Año destino</label>
            <input v-model="anioPromocion" class="campo-select" placeholder="2025-2026" />
          </div>
        </div>
        <div class="promocion-lista">
          <div v-for="g in grados.slice(0, 5)" :key="'prom-' + g.id_grado" class="promocion-item">
            <span class="promocion-nombre">{{ g.nombre }}</span>
            <Boton variante="exito" tamano="sm" @click="abrirModalPromocion(g)">Promover</Boton>
          </div>
        </div>
      </div>
    </template>

    <Modal :visible="modalAsignar" titulo="Asignar Maestro" @cerrar="modalAsignar = false">
      <div class="form-modal">
        <p class="modal-info">Grado: <strong>{{ gradoSeleccionado?.nombre }}</strong></p>
        <div class="campo-grupo">
          <label class="campo-etiqueta">Seleccionar maestro</label>
          <select v-model="maestroSeleccionado" class="campo-select">
            <option value="" disabled>Elegir maestro...</option>
            <option v-for="m in maestros" :key="m.id_usuario" :value="m.id_usuario">{{ m.nombre_completo }}</option>
          </select>
        </div>
        <div class="campo-grupo">
          <label class="campo-etiqueta">Año escolar</label>
          <input v-model="anioEscolar" class="campo-select" placeholder="2025-2026" />
        </div>
        <div class="form-acciones">
          <Boton variante="secundario" @click="modalAsignar = false">Cancelar</Boton>
          <Boton :cargando="guardandoAsignacion" :deshabilitado="!maestroSeleccionado" @click="crearAsignacion">Asignar</Boton>
        </div>
      </div>
    </Modal>

    <Modal :visible="modalPromocion" titulo="Confirmar Promoción" @cerrar="modalPromocion = false">
      <div class="form-modal">
        <div class="aviso-promocion">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <path d="M12 9v4M12 17h.01"/>
          </svg>
          <div>
            <p>¿Promover a <strong>todos los estudiantes</strong> de <strong>{{ gradoPromocion?.nombre }}</strong> al siguiente grado?</p>
            <p class="aviso-texto">Esta acción no se puede deshacer.</p>
          </div>
        </div>
        <div class="form-acciones">
          <Boton variante="secundario" @click="modalPromocion = false">Cancelar</Boton>
          <Boton variante="exito" :cargando="promoviendoGrado" @click="promoverGrado">Confirmar Promoción</Boton>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.grados-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}

.grado-card {
  background: white;
  border: 1px solid var(--gris-200);
  border-radius: var(--radio);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all var(--transicion);
}

.grado-card:hover {
  border-color: var(--gris-300);
  box-shadow: var(--sombra);
}

.grado-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.grado-icono {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--primario-claro);
  color: var(--primario);
  display: flex;
  align-items: center;
  justify-content: center;
}

.grado-anio-badge {
  font-size: 0.6875rem;
  background: var(--gris-100);
  color: var(--gris-600);
  padding: 2px 8px;
  border-radius: var(--radio-full);
  font-weight: 600;
}

.grado-nombre {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gris-900);
}

.maestro-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: #065f46;
  background: var(--exito-claro);
  padding: 4px 10px;
  border-radius: var(--radio-sm);
  font-weight: 500;
}

.sin-maestro {
  color: var(--gris-400);
  font-size: 0.8125rem;
  font-style: italic;
}

.grado-acciones {
  margin-top: auto;
}

.seccion-promocion {
  margin-top: 8px;
}

.promocion-cabecera {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 16px;
}

.seccion-titulo-sm {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gris-900);
  margin-bottom: 4px;
}

.seccion-desc {
  color: var(--gris-500);
  font-size: 0.8125rem;
}

.promocion-lista {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.promocion-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--gris-50);
  border-radius: var(--radio-sm);
}

.promocion-nombre {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--gris-700);
}

.modal-info {
  font-size: 0.875rem;
  color: var(--gris-600);
}

.aviso-promocion {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: var(--radio-sm);
  color: #92400e;
}

.aviso-promocion p {
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.aviso-texto {
  font-size: 0.8125rem !important;
  font-weight: 600;
  color: var(--peligro) !important;
}
</style>
