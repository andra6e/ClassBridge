<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import gruposApi from '../api/grupos.api'
import Boton from '../components/ui/Boton.vue'

const router = useRouter()
const grupos = ref([])
const cargando = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const { data } = await gruposApi.listarGrupos()
    grupos.value = data.data
  } catch (err) {
    error.value = err.response?.data?.mensaje || 'Error al cargar grupos'
  } finally {
    cargando.value = false
  }
})

function irAsistencia(idGrupo) {
  router.push(`/asistencia/${idGrupo}`)
}
</script>

<template>
  <div class="contenedor-pagina">
    <h1 class="titulo-pagina">Mis grupos</h1>

    <div v-if="cargando" class="cargando-centro">
      <div class="spinner spinner-grande"></div>
    </div>

    <div v-else-if="error" class="alerta alerta-error">{{ error }}</div>

    <div v-else-if="grupos.length === 0" class="mensaje-vacio">
      No tienes grupos asignados.
    </div>

    <div v-else class="grupos-grid">
      <div v-for="grupo in grupos" :key="grupo.id_grupo" class="grupo-tarjeta tarjeta">
        <div class="grupo-cabecera">
          <h3 class="grupo-nombre">{{ grupo.nombre }}</h3>
          <span class="grupo-badge" :class="grupo.activo ? 'badge-activo' : 'badge-inactivo'">
            {{ grupo.activo ? 'Activo' : 'Inactivo' }}
          </span>
        </div>
        <div class="grupo-info">
          <p><strong>Materia:</strong> {{ grupo.materia || 'Sin materia' }}</p>
          <p><strong>Grado:</strong> {{ grupo.nivel_grado || '-' }}</p>
          <p><strong>Ciclo:</strong> {{ grupo.anio_escolar || '-' }}</p>
        </div>
        <div class="grupo-acciones">
          <Boton variante="primario" tamano="sm" @click="irAsistencia(grupo.id_grupo)">
            Pase de lista
          </Boton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grupos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.grupo-tarjeta {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.grupo-cabecera {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.grupo-nombre {
  font-size: 1.1rem;
  font-weight: 600;
}

.grupo-badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-activo {
  background: var(--exito-claro);
  color: var(--exito);
}

.badge-inactivo {
  background: var(--gris-100);
  color: var(--gris-500);
}

.grupo-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.9rem;
  color: var(--gris-600);
}

.grupo-acciones {
  display: flex;
  gap: 8px;
  margin-top: auto;
}
</style>
