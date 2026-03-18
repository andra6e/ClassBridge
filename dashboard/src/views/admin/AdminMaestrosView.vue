<script setup>
import { ref, onMounted } from 'vue'
import adminApi from '../../api/admin.api'
import Boton from '../../components/ui/Boton.vue'
import Input from '../../components/ui/Input.vue'
import PhoneInput from '../../components/ui/PhoneInput.vue'
import Modal from '../../components/ui/Modal.vue'
import { isValidEmail, isValidInternationalPhone, isValidName, normalizeSpaces, sanitizeName } from '../../utils/formValidations'

const maestros = ref([])
const cargando = ref(true)
const modalVisible = ref(false)
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
  if (!normalizeSpaces(form.value.nombre_completo)) e.nombre_completo = 'El nombre es obligatorio'
  else if (!isValidName(form.value.nombre_completo)) e.nombre_completo = 'El nombre no debe contener números'
  if (!normalizeSpaces(form.value.correo)) e.correo = 'El correo es obligatorio'
  else if (!isValidEmail(form.value.correo)) e.correo = 'Correo no válido'
  if (!form.value.contrasena.trim()) e.contrasena = 'La contraseña es obligatoria'
  else if (form.value.contrasena.length < 6) e.contrasena = 'Mínimo 6 caracteres'
  if (normalizeSpaces(form.value.telefono) && !isValidInternationalPhone(form.value.telefono)) {
    e.telefono = 'Teléfono no válido para el país seleccionado'
  }
  errores.value = e
  return Object.keys(e).length === 0
}

async function cargarMaestros() {
  cargando.value = true
  try {
    const res = await adminApi.listarMaestros()
    maestros.value = res.data.data || []
  } catch {
    mostrarAlerta('error', 'Error al cargar maestros')
  }
  cargando.value = false
}

async function crearMaestro() {
  if (!validar()) return
  guardando.value = true
  try {
    await adminApi.crearMaestro({
      ...form.value,
      nombre_completo: sanitizeName(form.value.nombre_completo),
      correo: normalizeSpaces(form.value.correo),
      telefono: normalizeSpaces(form.value.telefono) || undefined,
    })
    modalVisible.value = false
    mostrarAlerta('exito', 'Maestro creado correctamente')
    await cargarMaestros()
  } catch (err) {
    const msg = err.response?.data?.mensaje || 'Error al crear maestro'
    mostrarAlerta('error', msg)
  }
  guardando.value = false
}

async function toggleActivo(maestro) {
  try {
    await adminApi.toggleMaestro(maestro.id_usuario, !maestro.activo)
    mostrarAlerta('exito', `Maestro ${maestro.activo ? 'desactivado' : 'activado'}`)
    await cargarMaestros()
  } catch {
    mostrarAlerta('error', 'Error al cambiar estado')
  }
}

function obtenerGrado(maestro) {
  const asignaciones = maestro.asignaciones || []
  const activa = asignaciones.find(a => a.activo)
  return activa?.grado?.nombre || null
}

onMounted(cargarMaestros)
</script>

<template>
  <div>
    <div class="cabecera-pagina">
      <div>
        <h1 class="titulo-pagina">Gestión de Maestros</h1>
        <p class="subtitulo-pagina">Administra los maestros registrados en el sistema</p>
      </div>
      <Boton @click="abrirModal">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        Nuevo Maestro
      </Boton>
    </div>

    <div v-if="alerta.mensaje" class="alerta" :class="`alerta-${alerta.tipo}`">{{ alerta.mensaje }}</div>

    <div class="tarjeta tabla-card">
      <div v-if="cargando" class="cargando-centro"><span class="spinner spinner-grande"></span></div>

      <template v-else-if="maestros.length">
        <div class="tabla-contenedor">
          <table class="tabla">
            <thead>
              <tr>
                <th>Maestro</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Grado asignado</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in maestros" :key="m.id_usuario">
                <td>
                  <div class="celda-usuario">
                    <div class="avatar-sm">{{ m.nombre_completo?.charAt(0)?.toUpperCase() }}</div>
                    <span class="celda-nombre">{{ m.nombre_completo }}</span>
                  </div>
                </td>
                <td>{{ m.correo }}</td>
                <td>{{ m.telefono || '—' }}</td>
                <td>
                  <span v-if="obtenerGrado(m)" class="badge badge-primario">{{ obtenerGrado(m) }}</span>
                  <span v-else class="texto-secundario">Sin asignar</span>
                </td>
                <td>
                  <span class="badge" :class="m.activo ? 'badge-activo' : 'badge-inactivo'">
                    {{ m.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td>
                  <Boton
                    :variante="m.activo ? 'fantasma' : 'exito'"
                    tamano="sm"
                    @click="toggleActivo(m)"
                  >
                    {{ m.activo ? 'Desactivar' : 'Activar' }}
                  </Boton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <div v-else class="vacio-estado">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--gris-300)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
        <p>No hay maestros registrados</p>
      </div>
    </div>

    <Modal :visible="modalVisible" titulo="Nuevo Maestro" @cerrar="modalVisible = false">
      <form @submit.prevent="crearMaestro" class="form-modal">
        <Input v-model="form.nombre_completo" etiqueta="Nombre completo" placeholder="Ej: Juan Pérez García" :error="errores.nombre_completo" solo-letras />
        <Input v-model="form.correo" etiqueta="Correo electrónico" tipo="email" placeholder="maestro@correo.com" :error="errores.correo" />
        <Input v-model="form.contrasena" etiqueta="Contraseña" tipo="password" placeholder="Mínimo 6 caracteres" :error="errores.contrasena" />
        <PhoneInput v-model="form.telefono" etiqueta="Teléfono (opcional)" :error="errores.telefono" default-country="HN" />
        <div class="form-acciones">
          <Boton variante="secundario" @click="modalVisible = false" type="button">Cancelar</Boton>
          <Boton type="submit" :cargando="guardando">Crear Maestro</Boton>
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

.badge-primario {
  background: var(--primario-claro);
  color: var(--primario);
}

.texto-secundario {
  color: var(--gris-400);
  font-size: 0.8125rem;
}
</style>
