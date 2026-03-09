<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../store/auth.store'
import maestroApi from '../api/maestro.api'
import AdminHomeView from './admin/AdminHomeView.vue'

const auth = useAuthStore()
const miGrado = ref(null)
const estudiantes = ref([])
const cargando = ref(false)
const error = ref('')

onMounted(async () => {
  if (auth.rolUsuario === 'maestro') {
    cargando.value = true
    try {
      const res = await maestroApi.obtenerMiGrado()
      miGrado.value = res.data.data
      if (miGrado.value) {
        const resEst = await maestroApi.listarEstudiantes({
          id_grado: miGrado.value.id_grado,
          anio_escolar: miGrado.value.anio_escolar
        })
        estudiantes.value = resEst.data.data || []
      }
    } catch (err) {
      error.value = err.response?.data?.mensaje || 'Error al cargar datos'
    } finally {
      cargando.value = false
    }
  }
})
</script>

<template>
  <AdminHomeView v-if="auth.rolUsuario === 'admin'" />

  <div v-else>
    <div class="cabecera-maestro">
      <h1 class="titulo-pagina">Bienvenido, {{ auth.nombreUsuario }}</h1>
      <p class="subtitulo-pagina">Gestiona tu grado, asistencia y contenido desde aquí</p>
    </div>

    <div v-if="cargando" class="cargando-centro"><span class="spinner spinner-grande"></span></div>
    <div v-else-if="error" class="alerta alerta-error">{{ error }}</div>

    <div v-else-if="!miGrado" class="tarjeta mensaje-vacio">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--gris-300)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
      </svg>
      <p style="margin-top: 12px;">No tienes un grado asignado. Contacta al administrador.</p>
    </div>

    <template v-else>
      <div class="grado-info">
        <div class="grado-card tarjeta">
          <div class="grado-icono">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 10L12 5 2 10l10 5 10-5z"/>
              <path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/>
            </svg>
          </div>
          <div class="grado-datos">
            <span class="grado-nombre">{{ miGrado.grado?.nombre || 'Grado' }}</span>
            <span class="grado-anio">Año escolar {{ miGrado.anio_escolar }}</span>
          </div>
          <div class="grado-stat">
            <span class="stat-numero">{{ estudiantes.length }}</span>
            <span class="stat-label">Estudiantes</span>
          </div>
        </div>
      </div>

      <h2 class="seccion-titulo">Acciones rápidas</h2>
      <div class="acciones-grid">
        <router-link to="/asistencia" class="accion-card">
          <div class="accion-icono" style="background: #eef2ff; color: #6366f1;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              <path d="M9 5a2 2 0 002 2h2a2 2 0 002-2"/>
              <path d="M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              <path d="M9 14l2 2 4-4"/>
            </svg>
          </div>
          <div class="accion-info">
            <span class="accion-nombre">Pasar Asistencia</span>
            <span class="accion-desc">Registra la asistencia del día</span>
          </div>
          <svg class="accion-flecha" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </router-link>

        <router-link to="/contenido" class="accion-card">
          <div class="accion-icono" style="background: #ecfdf5; color: #10b981;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
            </svg>
          </div>
          <div class="accion-info">
            <span class="accion-nombre">Registrar Contenido</span>
            <span class="accion-desc">Agrega el tema de cada materia</span>
          </div>
          <svg class="accion-flecha" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </router-link>

        <router-link to="/justificantes" class="accion-card">
          <div class="accion-icono" style="background: #fffbeb; color: #f59e0b;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <path d="M22 6l-10 7L2 6"/>
            </svg>
          </div>
          <div class="accion-info">
            <span class="accion-nombre">Justificantes</span>
            <span class="accion-desc">Revisa justificantes pendientes</span>
          </div>
          <svg class="accion-flecha" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </router-link>
      </div>
    </template>
  </div>
</template>

<style scoped>
.cabecera-maestro {
  margin-bottom: 24px;
}

.seccion-titulo {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gris-900);
  margin-bottom: 12px;
}

.grado-info {
  margin-bottom: 28px;
}

.grado-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.grado-icono {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--primario-claro);
  color: var(--primario);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.grado-datos {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.grado-nombre {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gris-900);
}

.grado-anio {
  font-size: 0.8125rem;
  color: var(--gris-500);
}

.grado-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 20px;
  background: var(--gris-50);
  border-radius: var(--radio-sm);
}

.stat-numero {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--gris-900);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.6875rem;
  color: var(--gris-500);
  font-weight: 500;
}

.acciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.accion-card {
  background: white;
  border: 1px solid var(--gris-200);
  border-radius: var(--radio);
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  text-decoration: none;
  transition: all var(--transicion);
}

.accion-card:hover {
  border-color: var(--gris-300);
  box-shadow: var(--sombra-md);
}

.accion-icono {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.accion-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.accion-nombre {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gris-800);
  margin-bottom: 2px;
}

.accion-desc {
  font-size: 0.75rem;
  color: var(--gris-500);
}

.accion-flecha {
  color: var(--gris-300);
  flex-shrink: 0;
}
</style>
