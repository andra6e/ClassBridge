<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import adminApi from '../../api/admin.api'
import Boton from '../../components/ui/Boton.vue'
import Input from '../../components/ui/Input.vue'
import Modal from '../../components/ui/Modal.vue'

const matriculas = ref([])
const grados = ref([])
const padres = ref([])
const estudiantes = ref([])
const cargando = ref(true)
const alerta = ref({ tipo: '', mensaje: '' })

const filtroAnio = ref('2025-2026')
const filtroEstado = ref('')
const filtroGrado = ref('')
const filtroTexto = ref('')

const modalDetalle = ref(false)
const modalEditar = ref(false)
const modalCrear = ref(false)
const guardando = ref(false)
const guardandoCrear = ref(false)
const mostrarAgregarHijo = ref(false)
const guardandoNuevoHijo = ref(false)
const nuevoHijo = ref({ nombre_completo: '', fecha_nacimiento: '', sexo: '', id_grado: '' })
const seleccionado = ref(null)
const hijosDelPadre = ref([])
const form = ref({ id_padre: '', id_estudiante: '', id_grado: '', anio_escolar: '', estado: 'activa' })
const formCrear = ref({ id_padre: '', id_estudiante: '', id_grado: '', anio_escolar: '2025-2026' })
const busquedaPadre = ref('')
const busquedaEstudiante = ref('')

const padreNuevo = ref({ nombre_completo: '', correo: '', contrasena: '', telefono: '' })
const anioEscolarRegistro = ref('2025-2026')
const alumnosRegistro = ref([
  { nombre_completo: '', fecha_nacimiento: '', sexo: '', id_grado: '' },
])

function mostrarAlerta(tipo, mensaje) {
  alerta.value = { tipo, mensaje }
  setTimeout(() => { alerta.value = { tipo: '', mensaje: '' } }, 4000)
}

function padreNombre(mat) {
  return mat.padre?.nombre_completo || mat.Padre?.nombre_completo || '—'
}

function estudianteNombre(mat) {
  return mat.estudiante?.nombre_completo || mat.Estudiante?.nombre_completo || '—'
}

function gradoNombre(mat) {
  return mat.grado?.nombre || mat.Grado?.nombre || '—'
}

async function cargarCatalogos() {
  try {
    const gRes = await adminApi.listarGrados()
    grados.value = gRes.data.data || []
  } catch { /* ignore */ }
  try {
    const pRes = await adminApi.listarPadres()
    padres.value = pRes.data.data || []
  } catch { /* ignore */ }
  try {
    const eRes = await adminApi.listarEstudiantes()
    estudiantes.value = eRes.data.data || []
  } catch { /* ignore */ }
}

async function cargarMatriculas() {
  cargando.value = true
  try {
    const res = await adminApi.listarMatriculas({ anio_escolar: filtroAnio.value || undefined })
    matriculas.value = res.data.data || []
  } catch {
    mostrarAlerta('error', 'Error al cargar matrículas')
  }
  cargando.value = false
}

const padresFiltrados = computed(() => {
  const q = (busquedaPadre.value || '').trim().toLowerCase()
  if (!q) return padres.value
  return padres.value.filter((p) => (p.nombre_completo || '').toLowerCase().includes(q))
})

const estudiantesFiltrados = computed(() => {
  const q = (busquedaEstudiante.value || '').trim().toLowerCase()
  if (!q) return estudiantes.value
  return estudiantes.value.filter((e) => (e.nombre_completo || '').toLowerCase().includes(q))
})

const matriculasFiltradas = computed(() => {
  return matriculas.value.filter((m) => {
    if (filtroEstado.value && m.estado !== filtroEstado.value) return false
    if (filtroGrado.value && String(m.id_grado) !== String(filtroGrado.value)) return false
    if (filtroTexto.value) {
      const txt = filtroTexto.value.toLowerCase()
      const match = padreNombre(m).toLowerCase().includes(txt)
        || estudianteNombre(m).toLowerCase().includes(txt)
      if (!match) return false
    }
    return true
  })
})

async function verMatricula(id) {
  try {
    const res = await adminApi.obtenerMatricula(id)
    seleccionado.value = res.data.data || res.data
    const idPadre = seleccionado.value?.id_padre
    hijosDelPadre.value = []
    if (idPadre) {
      const resHijos = await adminApi.listarMatriculas({ id_padre: idPadre })
      hijosDelPadre.value = resHijos.data?.data || resHijos.data || []
    }
    modalDetalle.value = true
  } catch {
    mostrarAlerta('error', 'No se pudo cargar el detalle')
  }
}

async function abrirEditar(m) {
  seleccionado.value = m
  form.value = {
    id_padre: m.id_padre,
    id_estudiante: m.id_estudiante,
    id_grado: m.id_grado,
    anio_escolar: m.anio_escolar,
    estado: m.estado || 'activa',
  }
  mostrarAgregarHijo.value = false
  nuevoHijo.value = { nombre_completo: '', fecha_nacimiento: '', sexo: '', id_grado: '' }
  hijosDelPadre.value = []
  if (m.id_padre) {
    try {
      const resHijos = await adminApi.listarMatriculas({ id_padre: m.id_padre })
      hijosDelPadre.value = resHijos.data?.data || resHijos.data || []
    } catch { /* ignore */ }
  }
  modalEditar.value = true
}

async function guardarNuevoHijo() {
  const idPadre = form.value.id_padre ? Number(form.value.id_padre) : null
  if (!idPadre) {
    mostrarAlerta('error', 'Debe estar seleccionado un padre')
    return
  }
  const a = nuevoHijo.value
  if (!(a.nombre_completo || '').trim() || (a.nombre_completo || '').trim().length < 3) {
    mostrarAlerta('error', 'Nombre del alumno es obligatorio (mín. 3 caracteres)')
    return
  }
  if (!a.id_grado) {
    mostrarAlerta('error', 'Selecciona el grado del alumno')
    return
  }
  const anio = (form.value.anio_escolar || '').trim()
  if (!/^\d{4}-\d{4}$/.test(anio)) {
    mostrarAlerta('error', 'Año escolar debe ser formato 2025-2026')
    return
  }
  guardandoNuevoHijo.value = true
  try {
    const estRes = await adminApi.crearEstudiante({
      nombre_completo: (a.nombre_completo || '').trim(),
      fecha_nacimiento: (a.fecha_nacimiento || '').trim().match(/^\d{4}-\d{2}-\d{2}$/) ? a.fecha_nacimiento.trim() : undefined,
      sexo: a.sexo === 'M' || a.sexo === 'F' ? a.sexo : undefined,
    })
    const idEst = estRes.data?.data?.id_estudiante ?? estRes.data?.id_estudiante
    if (!idEst) throw new Error('No se obtuvo id del estudiante')
    await adminApi.crearMatricula({
      id_padre: idPadre,
      id_estudiante: idEst,
      id_grado: Number(a.id_grado),
      anio_escolar: anio,
    })
    mostrarAlerta('exito', 'Estudiante y matrícula creados')
    await cargarMatriculas()
    await cargarCatalogos()
    const resHijos = await adminApi.listarMatriculas({ id_padre: idPadre })
    hijosDelPadre.value = resHijos.data?.data || resHijos.data || []
    nuevoHijo.value = { nombre_completo: '', fecha_nacimiento: '', sexo: '', id_grado: '' }
    mostrarAgregarHijo.value = false
  } catch (err) {
    mostrarAlerta('error', err.response?.data?.mensaje || 'Error al crear estudiante y matrícula')
  }
  guardandoNuevoHijo.value = false
}

async function guardarEdicion() {
  if (!seleccionado.value) return
  guardando.value = true
  try {
    await adminApi.actualizarMatricula(seleccionado.value.id_matricula, {
      id_padre: Number(form.value.id_padre),
      id_estudiante: Number(form.value.id_estudiante),
      id_grado: Number(form.value.id_grado),
      anio_escolar: form.value.anio_escolar,
      estado: form.value.estado,
    })
    modalEditar.value = false
    mostrarAlerta('exito', 'Matrícula actualizada')
    await cargarMatriculas()
  } catch (err) {
    mostrarAlerta('error', err.response?.data?.mensaje || 'Error al actualizar matrícula')
  }
  guardando.value = false
}

async function eliminarMatricula(m) {
  if (!confirm(`¿Eliminar matrícula de ${estudianteNombre(m)}?`)) return
  try {
    await adminApi.eliminarMatricula(m.id_matricula)
    mostrarAlerta('exito', 'Matrícula eliminada')
    await cargarMatriculas()
  } catch (err) {
    mostrarAlerta('error', err.response?.data?.mensaje || 'Error al eliminar matrícula')
  }
}

function abrirCrear() {
  formCrear.value = {
    id_padre: '',
    id_estudiante: '',
    id_grado: '',
    anio_escolar: filtroAnio.value || '2025-2026',
  }
  busquedaPadre.value = ''
  busquedaEstudiante.value = ''
  padreNuevo.value = { nombre_completo: '', correo: '', contrasena: '', telefono: '' }
  anioEscolarRegistro.value = filtroAnio.value || '2025-2026'
  alumnosRegistro.value = [{ nombre_completo: '', fecha_nacimiento: '', sexo: '', id_grado: '' }]
  modalCrear.value = true
}

function agregarAlumno() {
  alumnosRegistro.value.push({ nombre_completo: '', fecha_nacimiento: '', sexo: '', id_grado: '' })
}

function quitarAlumno(index) {
  if (alumnosRegistro.value.length <= 1) return
  alumnosRegistro.value.splice(index, 1)
}

async function guardarRegistroFamilia() {
  const anio = (anioEscolarRegistro.value || '').trim()
  if (!/^\d{4}-\d{4}$/.test(anio)) {
    mostrarAlerta('error', 'Año escolar debe ser formato 2025-2026')
    return
  }

  const alumnosValidos = alumnosRegistro.value.filter((a) => (a.nombre_completo || '').trim().length >= 3 && a.id_grado)
  if (alumnosValidos.length === 0) {
    mostrarAlerta('error', 'Añade al menos un alumno con nombre (mín. 3 caracteres) y grado')
    return
  }

  const p = padreNuevo.value
  if (!(p.nombre_completo || '').trim() || (p.nombre_completo || '').trim().length < 3) {
    mostrarAlerta('error', 'Nombre del padre es obligatorio (mín. 3 caracteres)')
    return
  }
  if (!(p.correo || '').trim()) {
    mostrarAlerta('error', 'Correo del padre es obligatorio')
    return
  }
  if (!(p.contrasena || '') || p.contrasena.length < 6) {
    mostrarAlerta('error', 'Contraseña del padre es obligatoria (mín. 6 caracteres)')
    return
  }
  guardandoCrear.value = true
  try {
    await adminApi.registrarFamilia({
      padre: {
        nombre_completo: p.nombre_completo.trim(),
        correo: p.correo.trim(),
        contrasena: p.contrasena,
        telefono: (p.telefono || '').trim() || undefined,
      },
      anio_escolar: anio,
      estudiantes: alumnosValidos.map((a) => ({
        nombre_completo: (a.nombre_completo || '').trim(),
        fecha_nacimiento: (a.fecha_nacimiento || '').trim().match(/^\d{4}-\d{2}-\d{2}$/) ? a.fecha_nacimiento.trim() : undefined,
        sexo: a.sexo === 'M' || a.sexo === 'F' ? a.sexo : undefined,
        id_grado: Number(a.id_grado),
      })),
    })
    modalCrear.value = false
    mostrarAlerta('exito', `Familia registrada: ${alumnosValidos.length} matrícula(s) creada(s)`)
    await cargarMatriculas()
    await cargarCatalogos()
  } catch (err) {
    mostrarAlerta('error', err.response?.data?.mensaje || 'Error al registrar familia')
  }
  guardandoCrear.value = false
}

watch(filtroAnio, () => cargarMatriculas())
onMounted(async () => {
  await cargarCatalogos()
  await cargarMatriculas()
})
</script>

<template>
  <div>
    <div class="cabecera-pagina cabecera-con-boton">
      <div>
        <h1 class="titulo-pagina">Matrículas</h1>
        <p class="subtitulo-pagina">Abre cada matrícula para ver contenido, filtrar, editar y eliminar.</p>
      </div>
      <Boton @click="abrirCrear">Nueva matrícula</Boton>
    </div>

    <div v-if="alerta.mensaje" class="alerta" :class="`alerta-${alerta.tipo}`">{{ alerta.mensaje }}</div>

    <div class="filtros-barra">
      <Input v-model="filtroAnio" etiqueta="Año escolar" placeholder="2025-2026" />
      <div class="campo-grupo">
        <label class="campo-etiqueta">Estado</label>
        <select v-model="filtroEstado" class="campo-select">
          <option value="">Todos</option>
          <option value="activa">Activa</option>
          <option value="retirada">Retirada</option>
          <option value="graduada">Graduada</option>
        </select>
      </div>
      <div class="campo-grupo">
        <label class="campo-etiqueta">Grado</label>
        <select v-model="filtroGrado" class="campo-select">
          <option value="">Todos</option>
          <option v-for="g in grados" :key="g.id_grado" :value="g.id_grado">{{ g.nombre }}</option>
        </select>
      </div>
      <Input v-model="filtroTexto" etiqueta="Buscar" placeholder="Padre o estudiante" />
    </div>

    <div class="tarjeta tabla-card">
      <div v-if="cargando" class="cargando-centro"><span class="spinner spinner-grande"></span></div>

      <template v-else-if="matriculasFiltradas.length">
        <div class="tabla-contenedor">
          <table class="tabla">
            <thead>
              <tr>
                <th>Padre / Tutor</th>
                <th>Estudiante</th>
                <th>Grado</th>
                <th>Año Escolar</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="mat in matriculasFiltradas" :key="mat.id_matricula">
                <td>{{ padreNombre(mat) }}</td>
                <td class="celda-nombre">{{ estudianteNombre(mat) }}</td>
                <td><span class="badge badge-primario">{{ gradoNombre(mat) }}</span></td>
                <td>{{ mat.anio_escolar }}</td>
                <td>
                  <span class="badge" :class="mat.estado === 'activa' ? 'badge-activo' : 'badge-inactivo'">
                    {{ mat.estado || 'activa' }}
                  </span>
                </td>
                <td class="acciones-tabla">
                  <Boton tamano="sm" variante="secundario" @click="verMatricula(mat.id_matricula)">Ver</Boton>
                  <Boton tamano="sm" @click="abrirEditar(mat)">Editar</Boton>
                  <Boton tamano="sm" variante="fantasma" @click="eliminarMatricula(mat)">Eliminar</Boton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <div v-else class="vacio-estado">
        <p>No hay matrículas para los filtros seleccionados.</p>
      </div>
    </div>

    <Modal :visible="modalDetalle" titulo="Detalle de matrícula" @cerrar="modalDetalle = false">
      <div v-if="seleccionado" class="detalle-con-hijos">
        <div class="detalle-padre">
          <strong>Padre / Tutor:</strong> {{ padreNombre(seleccionado) }}
        </div>
        <h4 class="bloque-titulo">Hijos matriculados ({{ hijosDelPadre.length }})</h4>
        <div class="tabla-contenedor tabla-hijos">
          <table class="tabla">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Grado</th>
                <th>Año escolar</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="mat in hijosDelPadre" :key="mat.id_matricula">
                <td class="celda-nombre">{{ estudianteNombre(mat) }}</td>
                <td><span class="badge badge-primario">{{ gradoNombre(mat) }}</span></td>
                <td>{{ mat.anio_escolar }}</td>
                <td>
                  <span class="badge" :class="mat.estado === 'activa' ? 'badge-activo' : 'badge-inactivo'">
                    {{ mat.estado || 'activa' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="hijosDelPadre.length === 0" class="sin-hijos">No hay más matrículas cargadas para este padre.</p>
      </div>
    </Modal>

    <Modal :visible="modalCrear" titulo="Registrar familia / Crear matrículas" @cerrar="modalCrear = false">
      <form @submit.prevent="guardarRegistroFamilia" class="form-modal form-registro-familia">
        <h4 class="bloque-titulo">Datos del padre / tutor</h4>
        <Input v-model="padreNuevo.nombre_completo" etiqueta="Nombre completo" placeholder="Ej. Juan Pérez López" />
        <Input v-model="padreNuevo.correo" etiqueta="Correo" tipo="email" placeholder="correo@ejemplo.com" />
        <Input v-model="padreNuevo.contrasena" etiqueta="Contraseña" tipo="password" placeholder="Mín. 6 caracteres" />
        <Input v-model="padreNuevo.telefono" etiqueta="Teléfono (opcional)" placeholder="+52 123 456 7890" />

        <Input v-model="anioEscolarRegistro" etiqueta="Año escolar" placeholder="2025-2026" />

        <h4 class="bloque-titulo">Alumnos (cada uno con su grado)</h4>
        <div v-for="(alumno, idx) in alumnosRegistro" :key="idx" class="alumno-bloque">
          <div class="alumno-bloque-cabecera">
            <span class="alumno-numero">Alumno {{ idx + 1 }}</span>
            <Boton v-if="alumnosRegistro.length > 1" tipo="button" variante="fantasma" tamano="sm" @click="quitarAlumno(idx)">Quitar</Boton>
          </div>
          <div class="alumno-campos">
            <Input v-model="alumno.nombre_completo" placeholder="Nombre completo" />
            <Input v-model="alumno.fecha_nacimiento" tipo="date" placeholder="Fecha nacimiento" />
            <div class="campo-grupo">
              <label class="campo-etiqueta">Sexo</label>
              <select v-model="alumno.sexo" class="campo-select">
                <option value="">—</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
            <div class="campo-grupo">
              <label class="campo-etiqueta">Grado</label>
              <select v-model="alumno.id_grado" class="campo-select">
                <option value="">Selecciona grado</option>
                <option v-for="g in grados" :key="g.id_grado" :value="g.id_grado">{{ g.nombre }}</option>
              </select>
            </div>
          </div>
        </div>
        <Boton tipo="button" variante="secundario" tamano="sm" @click="agregarAlumno" class="btn-agregar-alumno">+ Añadir otro alumno</Boton>

        <div class="form-acciones">
          <Boton variante="secundario" type="button" @click="modalCrear = false">Cancelar</Boton>
          <Boton type="submit" :cargando="guardandoCrear">Guardar familia y matrículas</Boton>
        </div>
      </form>
    </Modal>

    <Modal :visible="modalEditar" titulo="Editar matrícula" @cerrar="modalEditar = false">
      <form @submit.prevent="guardarEdicion" class="form-modal">
        <div v-if="hijosDelPadre.length" class="bloque-hijos-editar">
          <h4 class="bloque-titulo">Hijos de este padre ({{ hijosDelPadre.length }})</h4>
          <div class="tabla-contenedor tabla-hijos tabla-hijos-editar">
            <table class="tabla">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Grado</th>
                  <th>Año</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="mat in hijosDelPadre" :key="mat.id_matricula" :class="{ 'fila-actual': mat.id_matricula === seleccionado?.id_matricula }">
                  <td class="celda-nombre">{{ estudianteNombre(mat) }}</td>
                  <td><span class="badge badge-primario">{{ gradoNombre(mat) }}</span></td>
                  <td>{{ mat.anio_escolar }}</td>
                  <td>
                    <span class="badge" :class="mat.estado === 'activa' ? 'badge-activo' : 'badge-inactivo'">{{ mat.estado || 'activa' }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <h4 class="bloque-titulo">Editar esta matrícula</h4>
        <div class="campo-grupo">
          <label class="campo-etiqueta">Padre</label>
          <select v-model="form.id_padre" class="campo-select">
            <option v-for="p in padres" :key="p.id_usuario" :value="p.id_usuario">{{ p.nombre_completo }}</option>
          </select>
        </div>
        <div class="campo-grupo">
          <label class="campo-etiqueta">Estudiante</label>
          <select v-model="form.id_estudiante" class="campo-select">
            <option v-for="e in estudiantes" :key="e.id_estudiante" :value="e.id_estudiante">{{ e.nombre_completo }}</option>
          </select>
        </div>
        <div class="campo-grupo">
          <label class="campo-etiqueta">Grado</label>
          <select v-model="form.id_grado" class="campo-select">
            <option v-for="g in grados" :key="g.id_grado" :value="g.id_grado">{{ g.nombre }}</option>
          </select>
        </div>
        <Input v-model="form.anio_escolar" etiqueta="Año escolar" />
        <div class="campo-grupo">
          <label class="campo-etiqueta">Estado</label>
          <select v-model="form.estado" class="campo-select">
            <option value="activa">Activa</option>
            <option value="retirada">Retirada</option>
            <option value="graduada">Graduada</option>
          </select>
        </div>

        <div class="bloque-agregar-hijo">
          <div v-if="!mostrarAgregarHijo" class="agregar-hijo-trigger">
            <span>¿Este padre va a matricular otro niño?</span>
            <Boton tipo="button" variante="secundario" tamano="sm" @click="mostrarAgregarHijo = true">Añadir otro hijo</Boton>
          </div>
          <template v-else>
            <h4 class="bloque-titulo">Nuevo alumno (mismo padre)</h4>
            <div class="nuevo-hijo-campos">
              <Input v-model="nuevoHijo.nombre_completo" placeholder="Nombre completo" />
              <Input v-model="nuevoHijo.fecha_nacimiento" tipo="date" placeholder="Fecha nacimiento" />
              <div class="campo-grupo">
                <label class="campo-etiqueta">Sexo</label>
                <select v-model="nuevoHijo.sexo" class="campo-select">
                  <option value="">—</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
              <div class="campo-grupo">
                <label class="campo-etiqueta">Grado</label>
                <select v-model="nuevoHijo.id_grado" class="campo-select">
                  <option value="">Selecciona grado</option>
                  <option v-for="g in grados" :key="g.id_grado" :value="g.id_grado">{{ g.nombre }}</option>
                </select>
              </div>
            </div>
            <div class="agregar-hijo-acciones">
              <Boton tipo="button" variante="fantasma" tamano="sm" @click="mostrarAgregarHijo = false; nuevoHijo.nombre_completo = ''; nuevoHijo.fecha_nacimiento = ''; nuevoHijo.sexo = ''; nuevoHijo.id_grado = ''">Cancelar</Boton>
              <Boton tipo="button" :cargando="guardandoNuevoHijo" @click="guardarNuevoHijo">Crear estudiante y matrícula</Boton>
            </div>
          </template>
        </div>

        <div class="form-acciones">
          <Boton variante="secundario" type="button" @click="modalEditar = false">Cancelar</Boton>
          <Boton type="submit" :cargando="guardando">Guardar</Boton>
        </div>
      </form>
    </Modal>
  </div>
</template>

<style scoped>
.cabecera-con-boton {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.filtros-barra {
  display: grid;
  grid-template-columns: repeat(4, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.tabla-card { padding: 0; }
.badge-primario { background: var(--primario-claro); color: var(--primario); }
.acciones-tabla { display: flex; gap: 6px; flex-wrap: wrap; }
.detalle-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.detalle-con-hijos { max-width: 100%; }
.detalle-padre { margin-bottom: 12px; font-size: 0.9375rem; color: var(--gris-800); }
.tabla-hijos { max-height: 280px; overflow-y: auto; margin-bottom: 8px; }
.tabla-hijos .tabla { font-size: 0.875rem; }
.sin-hijos { font-size: 0.875rem; color: var(--gris-500); margin: 0; }
.bloque-hijos-editar { margin-bottom: 16px; }
.tabla-hijos-editar { max-height: 200px; overflow-y: auto; }
.fila-actual { background: var(--primario-claro); }
.busqueda-select { margin-bottom: 4px; }
.busqueda-select :deep(.campo-grupo) { margin-bottom: 0; gap: 4px; }
.busqueda-sin-resultados { font-size: 0.75rem; color: var(--gris-500); margin-top: 4px; margin-bottom: 0; }

.form-registro-familia { max-height: 75vh; overflow-y: auto; }
.bloque-titulo { font-size: 0.875rem; font-weight: 600; color: var(--gris-800); margin: 16px 0 8px; padding-bottom: 4px; border-bottom: 1px solid var(--gris-200); }
.bloque-titulo:first-of-type { margin-top: 0; }
.radio-grupo { display: flex; flex-direction: column; gap: 8px; margin-top: 6px; }
.radio-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.875rem; color: var(--gris-700); }
.radio-label input { width: auto; }
.alumno-bloque { background: var(--gris-50); border-radius: var(--radio); padding: 12px; margin-bottom: 12px; border: 1px solid var(--gris-200); }
.alumno-bloque-cabecera { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.alumno-numero { font-size: 0.8125rem; font-weight: 600; color: var(--gris-700); }
.alumno-campos { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 12px; }
.alumno-campos .campo-grupo { margin-bottom: 0; }
@media (max-width: 500px) { .alumno-campos { grid-template-columns: 1fr; } }
.btn-agregar-alumno { margin-bottom: 8px; }

.bloque-agregar-hijo { margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--gris-200); }
.agregar-hijo-trigger { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.agregar-hijo-trigger span { font-size: 0.875rem; color: var(--gris-700); }
.nuevo-hijo-campos { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 12px; margin-bottom: 12px; }
.nuevo-hijo-campos .campo-grupo { margin-bottom: 0; }
.agregar-hijo-acciones { display: flex; gap: 8px; flex-wrap: wrap; }
@media (max-width: 500px) { .nuevo-hijo-campos { grid-template-columns: 1fr; } }
</style>
