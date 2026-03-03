<script setup>
import { useAuthStore } from '../store/auth.store'

const auth = useAuthStore()

const accesosRapidos = [
  { titulo: 'Mis grupos', descripcion: 'Ver y gestionar tus grupos de clase', ruta: '/grupos', color: '#4f46e5' },
  { titulo: 'Justificantes', descripcion: 'Revisar justificantes pendientes', ruta: '/justificantes', color: '#f59e0b' },
]
</script>

<template>
  <div class="contenedor-pagina">
    <div class="bienvenida">
      <h1 class="bienvenida-titulo">Bienvenido, {{ auth.nombreUsuario }}</h1>
      <p class="bienvenida-sub">Panel de control del sistema ClassBridge</p>
    </div>

    <div class="accesos-grid">
      <router-link
        v-for="acceso in accesosRapidos"
        :key="acceso.ruta"
        :to="acceso.ruta"
        class="acceso-tarjeta"
      >
        <div class="acceso-barra" :style="{ background: acceso.color }"></div>
        <div class="acceso-cuerpo">
          <h3 class="acceso-titulo">{{ acceso.titulo }}</h3>
          <p class="acceso-desc">{{ acceso.descripcion }}</p>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.bienvenida {
  margin-bottom: 32px;
}

.bienvenida-titulo {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--gris-900);
}

.bienvenida-sub {
  color: var(--gris-500);
  margin-top: 4px;
}

.accesos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.acceso-tarjeta {
  background: white;
  border-radius: var(--radio);
  box-shadow: var(--sombra);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: transform var(--transicion), box-shadow var(--transicion);
}

.acceso-tarjeta:hover {
  transform: translateY(-2px);
  box-shadow: var(--sombra-md);
}

.acceso-barra {
  height: 4px;
}

.acceso-cuerpo {
  padding: 20px;
}

.acceso-titulo {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.acceso-desc {
  color: var(--gris-500);
  font-size: 0.85rem;
}
</style>
