<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import gruposApi from '../api/grupos.api'
import asistenciaApi from '../api/asistencia.api'
import Boton from '../components/ui/Boton.vue'

const route = useRoute()
const router = useRouter()
const idGrupo = Number(route.params.id_grupo)

const estudiantes = ref([])
const registros = ref({})
const cargando = ref(true)
const guardando = ref(false)
const error = ref('')
const exito = ref('')

const fechaHoy = computed(() => {
  const hoy = new Date()
  const anio = hoy.getFullYear()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
})

onMounted(async () => {
  try {
    const { data } = await gruposApi.listarEstudiantes(idGrupo)
    estudiantes.value = data.data
    estudiantes.value.forEach((est) => {
      registros.value[est.id_estudiante] = 'presente'
    })
  } catch (err) {
    error.value = err.response?.data?.mensaje || 'Error al cargar estudiantes'
  } finally {
    cargando.value = false
  }
})

async function guardar() {
  error.value = ''
  exito.value = ''
  guardando.value = true

  const listaRegistros = estudiantes.value.map((est) => ({
    id_estudiante: est.id_estudiante,
    estado: registros.value[est.id_estudiante],
  }))

  try {
    await asistenciaApi.guardar(idGrupo, fechaHoy.value, listaRegistros)
    exito.value = 'Asistencia guardada correctamente'
  } catch (err) {
    error.value = err.response?.data?.mensaje || 'Error al guardar asistencia'
  } finally {
    guardando.value = false
  }
}

function irContenido(idSesion) {
  router.push(`/contenido/${idSesion}`)
}
</script>

<template>
  <div class="contenedor-pagina">
    <div class="cabecera-pase">
      <div>
        <h1 class="titulo-pagina">Pase de lista</h1>
        <p class="subtitulo">Fecha: {{ fechaHoy }}</p>
      </div>
      <Boton variante="secundario" tamano="sm" @click="router.push('/grupos')">
        Volver a grupos
      </Boton>
    </div>

    <div v-if="cargando" class="cargando-centro">
      <div class="spinner spinner-grande"></div>
    </div>

    <div v-else-if="error && !estudiantes.length" class="alerta alerta-error">{{ error }}</div>

    <div v-else-if="estudiantes.length === 0" class="mensaje-vacio">
      No hay estudiantes inscritos en este grupo.
    </div>

    <div v-else class="tarjeta">
      <div v-if="exito" class="alerta alerta-exito">{{ exito }}</div>
      <div v-if="error && estudiantes.length" class="alerta alerta-error">{{ error }}</div>

      <table class="tabla-asistencia">
        <thead>
          <tr>
            <th class="col-numero">#</th>
            <th>Estudiante</th>
            <th class="col-estado">Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(est, i) in estudiantes" :key="est.id_estudiante">
            <td class="col-numero">{{ i + 1 }}</td>
            <td>
              <span class="nombre-estudiante">{{ est.nombre_completo }}</span>
              <span v-if="est.matricula" class="matricula">{{ est.matricula }}</span>
            </td>
            <td class="col-estado">
              <select
                v-model="registros[est.id_estudiante]"
                class="selector-estado"
                :class="`estado-${registros[est.id_estudiante]}`"
              >
                <option value="presente">Presente</option>
                <option value="ausente">Ausente</option>
                <option value="tarde">Tarde</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="acciones-pase">
        <Boton variante="exito" tamano="lg" :cargando="guardando" @click="guardar">
          Guardar asistencia
        </Boton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cabecera-pase {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.subtitulo {
  color: var(--gris-500);
  font-size: 0.9rem;
  margin-top: 4px;
}

.tabla-asistencia {
  width: 100%;
  border-collapse: collapse;
}

.tabla-asistencia th {
  text-align: left;
  padding: 12px 16px;
  background: var(--gris-50);
  border-bottom: 2px solid var(--gris-200);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gris-500);
  font-weight: 600;
}

.tabla-asistencia td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--gris-100);
}

.col-numero { width: 50px; text-align: center; }
.col-estado { width: 160px; }

.nombre-estudiante {
  display: block;
  font-weight: 500;
}

.matricula {
  font-size: 0.8rem;
  color: var(--gris-400);
}

.selector-estado {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--gris-300);
  border-radius: var(--radio);
  font-size: 0.85rem;
  font-weight: 500;
  outline: none;
  cursor: pointer;
}

.estado-presente { color: var(--exito); border-color: var(--exito); }
.estado-ausente { color: var(--peligro); border-color: var(--peligro); }
.estado-tarde { color: var(--advertencia); border-color: var(--advertencia); }

.acciones-pase {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}
</style>
