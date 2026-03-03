<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import contenidoApi from '../api/contenido.api'
import Boton from '../components/ui/Boton.vue'

const route = useRoute()
const router = useRouter()
const idSesion = Number(route.params.id_sesion)

const titulo = ref('')
const resumen = ref('')
const notasExtra = ref('')
const guardando = ref(false)
const error = ref('')
const exito = ref('')

async function guardar() {
  error.value = ''
  exito.value = ''

  if (!titulo.value.trim()) {
    error.value = 'El titulo es requerido'
    return
  }
  if (!resumen.value.trim()) {
    error.value = 'El resumen es requerido'
    return
  }

  guardando.value = true
  try {
    await contenidoApi.guardar(
      idSesion,
      titulo.value.trim(),
      resumen.value.trim(),
      notasExtra.value.trim() || null
    )
    exito.value = 'Contenido guardado correctamente'
    titulo.value = ''
    resumen.value = ''
    notasExtra.value = ''
  } catch (err) {
    error.value = err.response?.data?.mensaje || 'Error al guardar contenido'
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <div class="contenedor-pagina">
    <div class="cabecera-contenido">
      <h1 class="titulo-pagina">Subir contenido del dia</h1>
      <Boton variante="secundario" tamano="sm" @click="router.back()">
        Volver
      </Boton>
    </div>

    <div class="tarjeta">
      <div v-if="exito" class="alerta alerta-exito">{{ exito }}</div>
      <div v-if="error" class="alerta alerta-error">{{ error }}</div>

      <form class="form-contenido" @submit.prevent="guardar">
        <div class="campo">
          <label class="campo-etiqueta" for="titulo">Titulo</label>
          <input
            id="titulo"
            v-model="titulo"
            type="text"
            class="campo-input"
            placeholder="Titulo de la clase"
            maxlength="200"
          />
        </div>

        <div class="campo">
          <label class="campo-etiqueta" for="resumen">Resumen</label>
          <textarea
            id="resumen"
            v-model="resumen"
            class="campo-textarea"
            placeholder="Resumen del contenido visto en clase"
            rows="5"
          ></textarea>
        </div>

        <div class="campo">
          <label class="campo-etiqueta" for="notas">Notas extra (opcional)</label>
          <textarea
            id="notas"
            v-model="notasExtra"
            class="campo-textarea"
            placeholder="Tareas, recomendaciones, material adicional..."
            rows="3"
          ></textarea>
        </div>

        <div class="acciones-form">
          <Boton variante="primario" tamano="lg" :cargando="guardando">
            Guardar contenido
          </Boton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.cabecera-contenido {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.form-contenido {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.campo-input {
  padding: 10px 14px;
  border: 1px solid var(--gris-300);
  border-radius: var(--radio);
  font-size: 0.95rem;
  outline: none;
  transition: border-color var(--transicion);
}

.campo-input:focus,
.campo-textarea:focus {
  border-color: var(--primario);
  box-shadow: 0 0 0 3px var(--primario-claro);
}

.campo-textarea {
  padding: 10px 14px;
  border: 1px solid var(--gris-300);
  border-radius: var(--radio);
  font-size: 0.95rem;
  outline: none;
  resize: vertical;
  min-height: 80px;
  transition: border-color var(--transicion);
}

.acciones-form {
  display: flex;
  justify-content: flex-end;
}
</style>
