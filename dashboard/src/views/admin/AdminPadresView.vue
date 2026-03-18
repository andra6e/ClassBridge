<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import adminApi from '../../api/admin.api'
import Boton from '../../components/ui/Boton.vue'
import Input from '../../components/ui/Input.vue'
import PhoneInput from '../../components/ui/PhoneInput.vue'
import Modal from '../../components/ui/Modal.vue'
import { isValidEmail, isValidInternationalPhone, isValidName, normalizeSpaces, sanitizeName } from '../../utils/formValidations'

const padres = ref([])
const cargando = ref(true)
const modalDetalleVisible = ref(false)
const modalEditarVisible = ref(false)
const padreSeleccionado = ref(null)
const cargandoDetalle = ref(false)
const guardando = ref(false)
const alerta = ref({ tipo: '', mensaje: '' })

const filtroQ = ref('')
const filtroEstado = ref('')
const filtroEstudiante = ref('')

const form = ref({ nombre_completo: '', correo: '', telefono: '', activo: true })
const errores = ref({})

function mostrarAlerta(tipo, mensaje) {
  alerta.value = { tipo, mensaje }
  setTimeout(() => { alerta.value = { tipo: '', mensaje: '' } }, 4000)
}

function formatearFecha(f) {
  if (!f) return '—'
  const d = new Date(f)
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
}

function nombreEstudiante(m) {
  return m.estudiante?.nombre_completo || m.Estudiante?.nombre_completo || '—'
}

async function cargarPadres() {
  cargando.value = true
  try {
    const res = await adminApi.listarPadres({
      q: filtroQ.value || undefined,
      estado: filtroEstado.value || undefined,
      estudiante: filtroEstudiante.value || undefined,
    })
    padres.value = res.data.data || []
  } catch {
    mostrarAlerta('error', 'Error al cargar padres')
  }
  cargando.value = false
}

async function verPadre(id) {
  cargandoDetalle.value = true
  modalDetalleVisible.value = true
  padreSeleccionado.value = null
  try {
    const res = await adminApi.obtenerPadre(id)
    padreSeleccionado.value = res.data.data || res.data
  } catch {
    mostrarAlerta('error', 'Error al cargar datos del padre')
    modalDetalleVisible.value = false
  }
  cargandoDetalle.value = false
}

function abrirEditar(p) {
  padreSeleccionado.value = p
  form.value = {
    nombre_completo: p.nombre_completo || '',
    correo: p.correo || '',
    telefono: p.telefono || '',
    activo: p.activo !== false,
  }
  errores.value = {}
  modalEditarVisible.value = true
}

function validar() {
  const e = {}
  if (!normalizeSpaces(form.value.nombre_completo)) e.nombre_completo = 'El nombre es obligatorio'
  else if (!isValidName(form.value.nombre_completo)) e.nombre_completo = 'El nombre no debe contener números'
  if (!normalizeSpaces(form.value.correo)) e.correo = 'El correo es obligatorio'
  else if (!isValidEmail(form.value.correo)) e.correo = 'Correo no válido'
  if (normalizeSpaces(form.value.telefono) && !isValidInternationalPhone(form.value.telefono)) {
    e.telefono = 'Teléfono no válido para el país seleccionado'
  }
  errores.value = e
  return Object.keys(e).length === 0
}

async function guardarEdicion() {
  if (!validar() || !padreSeleccionado.value) return
  guardando.value = true
  try {
    await adminApi.actualizarPadre(padreSeleccionado.value.id_usuario, {
      nombre_completo: sanitizeName(form.value.nombre_completo),
      correo: normalizeSpaces(form.value.correo),
      telefono: normalizeSpaces(form.value.telefono),
      activo: form.value.activo,
    })
    modalEditarVisible.value = false
    mostrarAlerta('exito', 'Padre actualizado correctamente')
    await cargarPadres()
  } catch (err) {
    mostrarAlerta('error', err.response?.data?.mensaje || 'Error al actualizar padre')
  }
  guardando.value = false
}

async function eliminarPadre(p) {
  if (!confirm(`¿Eliminar al padre ${p.nombre_completo}? Esta acción eliminará sus matrículas asociadas.`)) return
  try {
    await adminApi.eliminarPadre(p.id_usuario)
    mostrarAlerta('exito', 'Padre eliminado')
    await cargarPadres()
  } catch (err) {
    mostrarAlerta('error', err.response?.data?.mensaje || 'Error al eliminar padre')
  }
}

const padresFiltrados = computed(() => padres.value)

watch([filtroQ, filtroEstado, filtroEstudiante], () => cargarPadres())
onMounted(cargarPadres)
</script>

<template>
  <div>
    <div class="cabecera-pagina">
      <div>
        <h1 class="titulo-pagina">Gestión de Padres</h1>
        <p class="subtitulo-pagina">Buscar, ver, editar y eliminar padres (sin alta manual desde esta sección)</p>
      </div>
    </div>

    <div v-if="alerta.mensaje" class="alerta" :class="`alerta-${alerta.tipo}`">{{ alerta.mensaje }}</div>

    <div class="filtros-barra">
      <Input v-model="filtroQ" etiqueta="Buscar" placeholder="Nombre, correo o teléfono" />
      <Input v-model="filtroEstudiante" etiqueta="Filtrar por estudiante" placeholder="Nombre del estudiante" />
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

      <template v-else-if="padresFiltrados.length">
        <div class="tabla-contenedor">
          <table class="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in padresFiltrados" :key="p.id_usuario">
                <td>{{ p.nombre_completo }}</td>
                <td>{{ p.correo }}</td>
                <td>{{ p.telefono || '—' }}</td>
                <td>
                  <span class="badge" :class="p.activo ? 'badge-activo' : 'badge-inactivo'">
                    {{ p.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="acciones-tabla">
                  <Boton tamano="sm" variante="secundario" @click="verPadre(p.id_usuario)">Ver</Boton>
                  <Boton tamano="sm" @click="abrirEditar(p)">Editar</Boton>
                  <Boton tamano="sm" variante="fantasma" @click="eliminarPadre(p)">Eliminar</Boton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <div v-else class="vacio-estado">
        <p>No hay padres para los filtros aplicados.</p>
      </div>
    </div>

    <Modal :visible="modalDetalleVisible" titulo="Detalle del Padre" @cerrar="modalDetalleVisible = false">
      <div v-if="cargandoDetalle" class="cargando-centro"><span class="spinner spinner-grande"></span></div>
      <div v-else-if="padreSeleccionado" class="detalle-padre">
        <div class="detalle-seccion">
          <h4 class="detalle-subtitulo">Datos personales</h4>
          <dl class="detalle-lista">
            <dt>Nombre completo</dt>
            <dd>{{ padreSeleccionado.nombre_completo }}</dd>
            <dt>Correo</dt>
            <dd>{{ padreSeleccionado.correo }}</dd>
            <dt>Teléfono</dt>
            <dd>{{ padreSeleccionado.telefono || '—' }}</dd>
            <dt>Estado</dt>
            <dd><span class="badge" :class="padreSeleccionado.activo ? 'badge-activo' : 'badge-inactivo'">{{ padreSeleccionado.activo ? 'Activo' : 'Inactivo' }}</span></dd>
            <dt>Último acceso</dt>
            <dd>{{ formatearFecha(padreSeleccionado.ultimo_login_en) }}</dd>
          </dl>
        </div>
        <div v-if="padreSeleccionado.matriculasComoPadre?.length" class="detalle-seccion">
          <h4 class="detalle-subtitulo">Hijos matriculados</h4>
          <div class="lista-hijos">
            <div v-for="m in padreSeleccionado.matriculasComoPadre" :key="m.id_matricula" class="item-hijo">
              <div class="hijo-info">
                <span class="hijo-nombre">{{ nombreEstudiante(m) }}</span>
                <span class="hijo-grado">{{ m.grado?.nombre || '—' }} · {{ m.anio_escolar }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>

    <Modal :visible="modalEditarVisible" titulo="Editar Padre" @cerrar="modalEditarVisible = false">
      <form @submit.prevent="guardarEdicion" class="form-modal">
        <Input v-model="form.nombre_completo" etiqueta="Nombre completo" :error="errores.nombre_completo" solo-letras />
        <Input v-model="form.correo" etiqueta="Correo" tipo="email" :error="errores.correo" />
        <PhoneInput v-model="form.telefono" etiqueta="Teléfono" :error="errores.telefono" default-country="HN" />
        <div class="campo-grupo">
          <label class="campo-etiqueta">Estado</label>
          <select v-model="form.activo" class="campo-select">
            <option :value="true">Activo</option>
            <option :value="false">Inactivo</option>
          </select>
        </div>
        <div class="form-acciones">
          <Boton variante="secundario" type="button" @click="modalEditarVisible = false">Cancelar</Boton>
          <Boton type="submit" :cargando="guardando">Guardar cambios</Boton>
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
.acciones-tabla { display: flex; gap: 6px; flex-wrap: wrap; }
.detalle-lista { display: grid; grid-template-columns: 130px 1fr; gap: 8px 16px; }
.detalle-lista dd { margin: 0; }
.lista-hijos { display: flex; flex-direction: column; gap: 8px; }
.item-hijo { padding: 10px 14px; background: var(--gris-50); border-radius: var(--radio-sm); }
.hijo-nombre { font-weight: 600; font-size: 0.875rem; display: block; }
.hijo-grado { font-size: 0.75rem; color: var(--gris-500); }
</style>
