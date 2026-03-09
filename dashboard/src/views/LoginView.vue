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
    error.value = 'Ingresa correo y contraseña'
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
      error.value = 'No se pudo conectar al servidor. Verifica que el backend esté corriendo.'
    } else {
      error.value = 'Error al iniciar sesión'
    }
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="login-contenedor">
    <div class="login-izq">
      <div class="login-marca">
        <div class="marca-icono">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10L12 5 2 10l10 5 10-5z"/>
            <path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/>
          </svg>
        </div>
        <span class="marca-nombre">ClassBridge</span>
      </div>

      <div class="login-tarjeta">
        <div class="login-cabecera">
          <h1 class="login-titulo">Bienvenido de vuelta</h1>
          <p class="login-sub">Ingresa tus credenciales para acceder al panel</p>
        </div>

        <form class="login-form" @submit.prevent="iniciarSesion">
          <div v-if="error" class="alerta alerta-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
            </svg>
            {{ error }}
          </div>

          <div class="campo">
            <label class="campo-etiqueta" for="correo">Correo electrónico</label>
            <input
              id="correo"
              v-model="correo"
              type="email"
              class="campo-input"
              placeholder="tu@correo.com"
              autocomplete="email"
            />
          </div>

          <div class="campo">
            <label class="campo-etiqueta" for="contrasena">Contraseña</label>
            <input
              id="contrasena"
              v-model="contrasena"
              type="password"
              class="campo-input"
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </div>

          <Boton variante="primario" tamano="lg" :cargando="cargando" style="width: 100%; margin-top: 4px;">
            Iniciar sesión
          </Boton>
        </form>
      </div>

      <p class="login-pie">Portal para maestros y administradores</p>
    </div>

    <div class="login-der">
      <div class="decoracion">
        <div class="decoracion-contenido">
          <h2>Gestiona tu institución educativa</h2>
          <p>Asistencia, contenido, comunicación con padres e inteligencia artificial en un solo lugar.</p>
          <div class="decoracion-stats">
            <div class="deco-stat">
              <span class="deco-stat-num">100%</span>
              <span class="deco-stat-label">Digital</span>
            </div>
            <div class="deco-stat">
              <span class="deco-stat-num">IA</span>
              <span class="deco-stat-label">Integrada</span>
            </div>
            <div class="deco-stat">
              <span class="deco-stat-num">24/7</span>
              <span class="deco-stat-label">Acceso</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-contenedor {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

.login-izq {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: white;
}

.login-marca {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 40px;
}

.marca-icono {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--primario);
  display: flex;
  align-items: center;
  justify-content: center;
}

.marca-nombre {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--gris-900);
  letter-spacing: -0.03em;
}

.login-tarjeta {
  width: 100%;
  max-width: 380px;
}

.login-cabecera {
  margin-bottom: 28px;
}

.login-titulo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gris-900);
  letter-spacing: -0.02em;
  margin-bottom: 4px;
}

.login-sub {
  color: var(--gris-500);
  font-size: 0.875rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.campo-etiqueta {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--gris-700);
}

.campo-input {
  padding: 10px 14px;
  border: 1px solid var(--gris-300);
  border-radius: var(--radio-sm);
  font-size: 0.9375rem;
  transition: border-color var(--transicion), box-shadow var(--transicion);
  outline: none;
  color: var(--gris-800);
}

.campo-input::placeholder {
  color: var(--gris-400);
}

.campo-input:focus {
  border-color: var(--primario);
  box-shadow: 0 0 0 3px var(--primario-claro);
}

.login-pie {
  margin-top: 32px;
  font-size: 0.75rem;
  color: var(--gris-400);
}

.login-der {
  flex: 1;
  background: linear-gradient(135deg, var(--primario) 0%, #818cf8 50%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.decoracion {
  max-width: 420px;
}

.decoracion-contenido h2 {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin-bottom: 12px;
}

.decoracion-contenido p {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 40px;
}

.decoracion-stats {
  display: flex;
  gap: 32px;
}

.deco-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.deco-stat-num {
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
}

.deco-stat-label {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

@media (max-width: 900px) {
  .login-der { display: none; }
  .login-izq { min-height: 100vh; }
}
</style>
