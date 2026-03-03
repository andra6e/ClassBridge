<script setup>
import { useAuthStore } from '../../store/auth.store'

const auth = useAuthStore()
</script>

<template>
  <header class="topbar">
    <div class="topbar-izq">
      <slot name="titulo">
        <span class="topbar-titulo">Dashboard</span>
      </slot>
    </div>
    <div class="topbar-der">
      <div class="topbar-usuario">
        <span class="usuario-nombre">{{ auth.nombreUsuario }}</span>
        <span class="usuario-rol">{{ auth.rolUsuario }}</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  height: 64px;
  background: white;
  border-bottom: 1px solid var(--gris-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.topbar-titulo {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--gris-800);
}

.topbar-usuario {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.usuario-nombre {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gris-800);
}

.usuario-rol {
  font-size: 0.75rem;
  color: var(--gris-400);
  text-transform: capitalize;
}
</style>
