<script setup>
import { ref, onMounted, watch } from 'vue'
import adminApi from '../../api/admin.api'
import Boton from '../../components/ui/Boton.vue'
import Input from '../../components/ui/Input.vue'
import Modal from '../../components/ui/Modal.vue'

const matriculas = ref([])
const grados = ref([])
const cargando = ref(true)
const modalVisible = ref(false)
const guardando = ref(false)
const alerta = ref({ tipo: '', mensaje: '' })

const filtroAnio = ref('2025-2026')

const form = ref({
  padre: { nombre_completo: '', correo: '', contrasena: '', telefono: '' },
  anio_escolar: '2025-2026',
  estudiantes: [{ nombre_completo: '', fecha_nacimiento: '', sexo: '', id_grado: '' }],
})
const errores = ref({})

function limpiarForm() {
  form.value = {
    padre: { nombre_completo: '', correo: '', contrasena: '', telefono: '' },
    anio_escolar: '2025-2026',
    estudiantes: [{ nombre_completo: '', fecha_nacimiento: '', sexo: '', id_grado: '' }],
  }
  errores.value = {}
}

function agregarEstudiante() {
  form.value.estudiantes.push({ nombre_completo: '', fecha_nacimiento: '', sexo: '', id_grado: '' })
}

function quitarEstudiante(index) {
  if (form.value.estudiantes.length > 1) form.value.estudiantes.splice(index, 1)
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
  if (!form.value.padre.nombre_completo.trim()) e.padre_nombre = 'Nombre del padre es obligatorio'
  if (!form.value.padre.correo.trim()) e.padre_correo = 'Correo del padre es obligatorio'
  if (!form.value.padre.contrasena.length || form.value.padre.contrasena.length < 6) e.padre_contrasena = 'Mínimo 6 caracteres'
  if (!form.value.anio_escolar.trim()) e.anio_escolar = 'Año escolar es obligatorio'

  const estErrores = []
  form.value.estudiantes.forEach((est, i) => {
    const err = {}
    if (!est.nombre_completo?.trim()) err.nombre = 'Nombre obligatorio'
    if (!est.id_grado) err.grado = 'Selecciona grado'
    if (Object.keys(err).length) estErrores[i] = err
  })
  errores.value = { ...e, estudiantes: estErrores }
  const tieneErroresEst = estErrores.some((err) => err && Object.keys(err).length > 0)
  return Object.keys(e).length === 0 && !tieneErroresEst
}

function obtenerPadreNombre(mat) {
  return mat.padre?.nombre_completo || mat.Padre?.nombre_completo || '—'
}

function obtenerEstudianteNombre(mat) {
  return mat.estudiante?.nombre_completo || mat.Estudiante?.nombre_completo || '—'
}

function obtenerGradoNombre(mat) {
  return mat.grado?.nombre || mat.Grado?.nombre || '—'
}

async function cargarMatriculas() {
  cargando.value = true
  try {
    const res = await adminApi.listarMatriculas(filtroAnio.value || undefined)
    matriculas.value = res.data.data || []
  } catch {
    mostrarAlerta('error', 'Error al cargar matrículas')
  }
  cargando.value = false
}

async function cargarGrados() {
  try {
    const gRes = await adminApi.listarGrados()
    grados.value = gRes.data.data || []
  } catch { /* ignore */ }
}

async function registrarFamilia() {
  if (!validar()) return
  const estudiantesValidos = form.value.estudiantes.filter(e => e.nombre_completo?.trim() && e.id_grado)
  if (!estudiantesValidos.length) {
    mostrarAlerta('error', 'Agrega al menos un estudiante con nombre y grado')
    return
  }
  guardando.value = true
  try {
    await adminApi.registrarFamilia({
      padre: {
        nombre_completo: form.value.padre.nombre_completo.trim(),
        correo: form.value.padre.correo.trim(),
        contrasena: form.value.padre.contrasena,
        telefono: form.value.padre.telefono?.trim() || undefined,
      },
      anio_escolar: form.value.anio_escolar.trim(),
      estudiantes: estudiantesValidos.map(e => ({
        nombre_completo: e.nombre_completo.trim(),
        fecha_nacimiento: e.fecha_nacimiento || undefined,
        sexo: e.sexo || undefined,
        id_grado: Number(e.id_grado),
      })),
    })
    modalVisible.value = false
    mostrarAlerta('exito', 'Familia registrada correctamente')
    await cargarMatriculas()
  } catch (err) {
    mostrarAlerta('error', err.response?.data?.mensaje || 'Error al registrar familia')
  }
  guardando.value = false
}

watch(filtroAnio, () => cargarMatriculas())

onMounted(async () => {
  await Promise.all([cargarMatriculas(), cargarGrados()])
})
</script>

<template>
  <div>
    <div class="cabecera-pagina">
      <div>
        <h1 class="titulo-pagina">Matrículas</h1>
        <p class="subtitulo-pagina">Registra familias e inscribe estudiantes en grados</p>
      </div>
      <Boton @click="abrirModal">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        Registrar Familia
      </Boton>
    </div>

    <div v-if="alerta.mensaje" class="alerta" :class="`alerta-${alerta.tipo}`">{{ alerta.mensaje }}</div>

    <div class="filtros-barra">
      <div class="campo-grupo">
        <label class="campo-etiqueta">Año escolar</label>
        <input v-model="filtroAnio" class="campo-select" placeholder="Ej: 2025-2026" />
      </div>
      <div class="filtro-resultado">
        <span class="resultado-count">{{ matriculas.length }}</span> matrículas
      </div>
    </div>

    <div class="tarjeta tabla-card">
      <div v-if="cargando" class="cargando-centro"><span class="spinner spinner-grande"></span></div>

      <template v-else-if="matriculas.length">
        <div class="tabla-contenedor">
          <table class="tabla">
            <thead>
              <tr>
                <th>Padre / Tutor</th>
                <th>Estudiante</th>
                <th>Grado</th>
                <th>Año Escolar</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="mat in matriculas" :key="mat.id_matricula">
                <td>{{ obtenerPadreNombre(mat) }}</td>
                <td class="celda-nombre">{{ obtenerEstudianteNombre(mat) }}</td>
                <td><span class="badge badge-primario">{{ obtenerGradoNombre(mat) }}</span></td>
                <td>{{ mat.anio_escolar }}</td>
                <td>
                  <span class="badge" :class="mat.estado === 'activa' ? 'badge-activo' : 'badge-inactivo'">
                    {{ mat.estado || 'Activa' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <div v-else class="vacio-estado">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--gris-300)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/>
        </svg>
        <p>No hay matrículas para el año seleccionado</p>
      </div>
    </div>

    <Modal :visible="modalVisible" titulo="Registrar Familia" ancho="640px" @cerrar="modalVisible = false">
      <form @submit.prevent="registrarFamilia" class="form-modal">
        <div class="seccion-form">
          <h4 class="seccion-label">Datos del Padre</h4>
          <div class="form-grid-2">
            <Input v-model="form.padre.nombre_completo" etiqueta="Nombre completo" placeholder="Ej: Carlos López" :error="errores.padre_nombre" />
            <Input v-model="form.padre.correo" etiqueta="Correo electrónico" tipo="email" placeholder="padre@ejemplo.com" :error="errores.padre_correo" />
            <Input v-model="form.padre.contrasena" etiqueta="Contraseña" tipo="password" placeholder="Mínimo 6 caracteres" :error="errores.padre_contrasena" />
            <Input v-model="form.padre.telefono" etiqueta="Teléfono (opcional)" placeholder="+504 0000-0000" />
          </div>
        </div>

        <div class="seccion-form">
          <h4 class="seccion-label">Estudiantes</h4>
          <div class="form-grid-2" style="margin-bottom: 12px;">
            <Input v-model="form.anio_escolar" etiqueta="Año escolar" placeholder="2025-2026" :error="errores.anio_escolar" />
          </div>

          <div v-for="(est, idx) in form.estudiantes" :key="idx" class="estudiante-bloque">
            <div class="estudiante-head">
              <span class="estudiante-num">Estudiante {{ idx + 1 }}</span>
              <button v-if="form.estudiantes.length > 1" type="button" class="btn-quitar" @click="quitarEstudiante(idx)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div class="form-grid-2">
              <Input v-model="est.nombre_completo" etiqueta="Nombre" placeholder="Ej: Ana López" :error="errores.estudiantes?.[idx]?.nombre" />
              <div class="campo-grupo">
                <label class="campo-etiqueta">Grado</label>
                <select v-model="est.id_grado" class="campo-select">
                  <option value="" disabled>Seleccionar...</option>
                  <option v-for="g in grados" :key="g.id_grado" :value="g.id_grado">{{ g.nombre }}</option>
                </select>
                <span v-if="errores.estudiantes?.[idx]?.grado" class="campo-error-txt">{{ errores.estudiantes[idx].grado }}</span>
              </div>
              <Input v-model="est.fecha_nacimiento" etiqueta="Fecha nac. (opc.)" tipo="date" />
              <div class="campo-grupo">
                <label class="campo-etiqueta">Sexo (opc.)</label>
                <select v-model="est.sexo" class="campo-select">
                  <option value="">—</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
            </div>
          </div>

          <Boton variante="secundario" tamano="sm" type="button" @click="agregarEstudiante">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Agregar estudiante
          </Boton>
        </div>

        <div class="form-acciones">
          <Boton variante="secundario" type="button" @click="modalVisible = false">Cancelar</Boton>
          <Boton type="submit" :cargando="guardando">Registrar Familia</Boton>
        </div>
      </form>
    </Modal>
  </div>
</template>

<style scoped>
.filtros-barra {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 16px;
}

.filtros-barra .campo-grupo {
  max-width: 200px;
}

.filtro-resultado {
  font-size: 0.8125rem;
  color: var(--gris-500);
  padding-bottom: 8px;
}

.resultado-count {
  font-weight: 700;
  color: var(--gris-800);
}

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

.badge-primario {
  background: var(--primario-claro);
  color: var(--primario);
}

.seccion-form {
  margin-bottom: 20px;
}

.seccion-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gris-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--gris-100);
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.estudiante-bloque {
  padding: 14px;
  background: var(--gris-50);
  border-radius: var(--radio-sm);
  margin-bottom: 10px;
}

.estudiante-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.estudiante-num {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gris-500);
  text-transform: uppercase;
}

.btn-quitar {
  background: none;
  border: none;
  color: var(--gris-400);
  padding: 4px;
  border-radius: 4px;
  transition: all var(--transicion);
  display: flex;
}

.btn-quitar:hover {
  background: var(--peligro-claro);
  color: var(--peligro);
}

.campo-error-txt {
  font-size: 0.75rem;
  color: var(--peligro);
  font-weight: 500;
}
</style>
