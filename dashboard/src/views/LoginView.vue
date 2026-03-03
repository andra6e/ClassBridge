<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth.store'
import Boton from '../components/ui/Boton.vue'

const router = useRouter()
const auth = useAuthStore()

const correo = ref('')
const contrasena = ref('')
const cargando = ref(false)
const error = ref('')

async function iniciarSesion() {
  error.value = ''
  if (!correo.value || !contrasena.value) {
    error.value = 'Ingresa correo y contrasena'
    return
  }

  cargando.value = true
  try {
    await auth.login(correo.value, contrasena.value)
    router.push('/dashboard')
  } catch (err) {
    if (err.response?.data?.mensaje) {
      error.value = err.response.data.mensaje
    } else if (!err.response) {
      error.value = 'No se pudo conectar al servidor. Verifica que el backend este corriendo en http://localhost:3000'
    } else {
      error.value = 'Error al iniciar sesion'
    }
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="login-tarjeta">
    <div class="login-cabecera">
      <h1 class="login-titulo">ClassBridge</h1>
      <p class="login-sub">Portal de maestros y administradores</p>
    </div>

    <form class="login-form" @submit.prevent="iniciarSesion">
      <div v-if="error" class="alerta alerta-error">{{ error }}</div>

      <div class="campo">
        <label class="campo-etiqueta" for="correo">Correo electronico</label>
        <input
          id="correo"
          v-model="correo"
          type="email"
          class="campo-input"
          placeholder="maestro@classbridge.com"
          autocomplete="email"
        />
      </div>

      <div class="campo">
        <label class="campo-etiqueta" for="contrasena">Contrasena</label>
        <input
          id="contrasena"
          v-model="contrasena"
          type="password"
          class="campo-input"
          placeholder="Tu contrasena"
          autocomplete="current-password"
        />
      </div>

      <Boton variante="primario" tamano="lg" :cargando="cargando" style="width:100%">
        Iniciar sesion
      </Boton>
    </form>
  </div>
</template>

<style scoped>
.login-tarjeta {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
  width: 100%;
  max-width: 420px;
}

.login-cabecera {
  text-align: center;
  margin-bottom: 32px;
}

.login-titulo {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primario);
}

.login-sub {
  color: var(--gris-500);
  font-size: 0.9rem;
  margin-top: 4px;
}

.login-form {
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
  transition: border-color var(--transicion);
  outline: none;
}

.campo-input:focus {
  border-color: var(--primario);
  box-shadow: 0 0 0 3px var(--primario-claro);
}
</style>
