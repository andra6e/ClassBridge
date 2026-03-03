<script setup>
defineProps({
  variante: { type: String, default: 'primario' },
  tamano: { type: String, default: 'md' },
  cargando: { type: Boolean, default: false },
  deshabilitado: { type: Boolean, default: false },
})
</script>

<template>
  <button
    class="boton"
    :class="[`boton-${variante}`, `boton-${tamano}`]"
    :disabled="cargando || deshabilitado"
  >
    <span v-if="cargando" class="spinner"></span>
    <slot v-else />
  </button>
</template>

<style scoped>
.boton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: var(--radio);
  font-weight: 600;
  transition: all var(--transicion);
  white-space: nowrap;
}

.boton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.boton-sm { padding: 6px 12px; font-size: 0.8rem; }
.boton-md { padding: 10px 20px; font-size: 0.9rem; }
.boton-lg { padding: 12px 24px; font-size: 1rem; }

.boton-primario {
  background: var(--primario);
  color: white;
}
.boton-primario:hover:not(:disabled) { background: var(--primario-hover); }

.boton-exito {
  background: var(--exito);
  color: white;
}
.boton-exito:hover:not(:disabled) { background: #15803d; }

.boton-peligro {
  background: var(--peligro);
  color: white;
}
.boton-peligro:hover:not(:disabled) { background: #b91c1c; }

.boton-secundario {
  background: var(--gris-100);
  color: var(--gris-700);
  border: 1px solid var(--gris-300);
}
.boton-secundario:hover:not(:disabled) { background: var(--gris-200); }
</style>
