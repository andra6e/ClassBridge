<script setup>
import { ref, onMounted } from 'vue'
import adminApi from '../../api/admin.api'
import Boton from '../../components/ui/Boton.vue'
import Input from '../../components/ui/Input.vue'
import Modal from '../../components/ui/Modal.vue'

const padres = ref([])
const cargando = ref(true)
const modalVisible = ref(false)
const modalDetalleVisible = ref(false)
const padreSeleccionado = ref(null)
const cargandoDetalle = ref(false)
const guardando = ref(false)
const alerta = ref({ tipo: '', mensaje: '' })

const form = ref({ nombre_completo: '', correo: '', contrasena: '', telefono: '' })
const errores = ref({})

function limpiarForm() {
  form.value = { nombre_completo: '', correo: '', contrasena: '', telefono: '' }
  errores.value = {}
}

function abrirModal() {
  limpiarForm()
  modalVisible.value = true
}

function mostrarAlerta(tipo, mensaje) {
  alerta.value = { tipo, mensaje }
  setTimeout(() => { alerta.value = { tipo: '', mensaje: '' } }, 4000)
}

function validar() {
  const e = {}
  if (!form.value.nombre_completo.trim()) e.nombre_completo = 'El nombre es obligatorio'
  if (!form.value.correo.trim()) e.correo = 'El correo es obligatorio'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.correo)) e.correo = 'Correo no válido'
  if (!form.value.contrasena.trim()) e.contrasena = 'La contraseña es obligatoria'
  else if (form.value.contrasena.length < 6) e.contrasena = 'Mínimo 6 caracteres'
  errores.value = e
  return Object.keys(e).length === 0
}

async function cargarPadres() {
  cargando.value = true
  try {
    const res = await adminApi.listarPadres()
    padres.value = res.data.data || []
  } catch {
    mostrarAlerta('error', 'Error al cargar padres')
  }
  cargando.value = false
}

async function crearPadre() {
  if (!validar()) return
  guardando.value = true
  try {
    await adminApi.crearPadre(form.value)
    modalVisible.value = false
    mostrarAlerta('exito', 'Padre creado correctamente')
    await cargarPadres()
  } catch (err) {
    const msg = err.response?.data?.message || 'Error al crear padre'
    mostrarAlerta('error', msg)
  }
  guardando.value = false
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

function formatearFecha(f) {
  if (!f) return '—'
  const d = new Date(f)
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(cargarPadres)
</script>

<template>
  <div>
    <div class="cabecera-pagina">
      <div>
        <h1 class="titulo-pagina">Gestión de Padres</h1>
        <p class="subtitulo-pagina">Administra los padres de familia registrados</p>
      </div>
      <Boton @click="abrirModal">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        Nuevo Padre
      </Boton>
    </div>

    <div v-if="alerta.mensaje" class="alerta" :class="`alerta-${alerta.tipo}`">{{ alerta.mensaje }}</div>

    <div class="tarjeta tabla-card">
      <div v-if="cargando" class="cargando-centro"><span class="spinner spinner-grande"></span></div>

      <template v-else-if="padres.length">
        <div class="tabla-contenedor">
          <table class="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in padres" :key="p.id_usuario" class="fila-clicable" @click="verPadre(p.id_usuario)">
                <td>
                  <div class="celda-usuario">
                    <div class="avatar-sm avatar-verde">{{ p.nombre_completo?.charAt(0)?.toUpperCase() }}</div>
                    <span class="celda-nombre">{{ p.nombre_completo }}</span>
                  </div>
                </td>
                <td>{{ p.correo }}</td>
                <td>{{ p.telefono || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <div v-else class="vacio-estado">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--gris-300)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
        </svg>
        <p>No hay padres registrados</p>
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
                <span class="hijo-nombre">{{ m.estudiante?.nombre_completo || '—' }}</span>
                <span class="hijo-grado">{{ m.grado?.nombre || '—' }} · {{ m.anio_escolar }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="detalle-seccion">
          <p class="texto-vacio">No tiene hijos matriculados activamente.</p>
        </div>
      </div>
    </Modal>

    <Modal :visible="modalVisible" titulo="Nuevo Padre" @cerrar="modalVisible = false">
      <form @submit.prevent="crearPadre" class="form-modal">
        <Input v-model="form.nombre_completo" etiqueta="Nombre completo" placeholder="Ej: María López Hernández" :error="errores.nombre_completo" />
        <Input v-model="form.correo" etiqueta="Correo electrónico" tipo="email" placeholder="padre@correo.com" :error="errores.correo" />
        <Input v-model="form.contrasena" etiqueta="Contraseña" tipo="password" placeholder="Mínimo 6 caracteres" :error="errores.contrasena" />
        <Input v-model="form.telefono" etiqueta="Teléfono (opcional)" placeholder="+504 0000-0000" />
        <div class="form-acciones">
          <Boton variante="secundario" @click="modalVisible = false" type="button">Cancelar</Boton>
          <Boton type="submit" :cargando="guardando">Crear Padre</Boton>
        </div>
      </form>
    </Modal>
  </div>
</template>

<style scoped>
.tabla-card { padding: 0; }
.tabla-card .cargando-centro,
.tabla-card .vacio-estado { padding: 64px 24px; }

.vacio-estado {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--gris-400);
  font-size: 0.875rem;
}

.celda-usuario {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--primario-claro);
  color: var(--primario);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8125rem;
  flex-shrink: 0;
}

.avatar-verde {
  background: var(--exito-claro);
  color: #065f46;
}

.fila-clicable { cursor: pointer; }

.detalle-padre {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detalle-seccion {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--gris-100);
}

.detalle-seccion:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.detalle-subtitulo {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gris-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.detalle-lista {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 8px 16px;
  font-size: 0.875rem;
}

.detalle-lista dt {
  color: var(--gris-500);
  font-weight: 500;
}

.detalle-lista dd {
  margin: 0;
  color: var(--gris-800);
}

.lista-hijos {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-hijo {
  padding: 10px 14px;
  background: var(--gris-50);
  border-radius: var(--radio-sm);
}

.hijo-nombre {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--gris-800);
  display: block;
}

.hijo-grado {
  font-size: 0.75rem;
  color: var(--gris-500);
}

.texto-vacio {
  color: var(--gris-400);
  font-size: 0.875rem;
  text-align: center;
  padding: 16px 0;
}
</style>
