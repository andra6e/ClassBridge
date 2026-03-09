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
    <span v-if="cargando" class="spinner-btn"></span>
    <slot v-else />
  </button>
</template>

<style scoped>
.boton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid transparent;
  border-radius: var(--radio-sm);
  font-weight: 600;
  transition: all var(--transicion);
  white-space: nowrap;
  cursor: pointer;
  line-height: 1;
}

.boton:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.boton-sm { padding: 6px 12px; font-size: 0.8125rem; }
.boton-md { padding: 9px 16px; font-size: 0.875rem; }
.boton-lg { padding: 11px 20px; font-size: 0.9375rem; }

.boton-primario {
  background: var(--primario);
  color: white;
  box-shadow: 0 1px 2px rgba(99, 102, 241, 0.3);
}
.boton-primario:hover:not(:disabled) {
  background: var(--primario-hover);
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.35);
}

.boton-exito {
  background: var(--exito);
  color: white;
  box-shadow: 0 1px 2px rgba(16, 185, 129, 0.3);
}
.boton-exito:hover:not(:disabled) { background: var(--exito-hover); }

.boton-peligro {
  background: var(--peligro);
  color: white;
  box-shadow: 0 1px 2px rgba(239, 68, 68, 0.3);
}
.boton-peligro:hover:not(:disabled) { background: var(--peligro-hover); }

.boton-secundario {
  background: white;
  color: var(--gris-700);
  border: 1px solid var(--gris-300);
  box-shadow: var(--sombra-xs);
}
.boton-secundario:hover:not(:disabled) {
  background: var(--gris-50);
  border-color: var(--gris-400);
}

.boton-fantasma {
  background: transparent;
  color: var(--gris-600);
}
.boton-fantasma:hover:not(:disabled) {
  background: var(--gris-100);
  color: var(--gris-800);
}

.spinner-btn {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: girar 0.6s linear infinite;
}

.boton-secundario .spinner-btn {
  border-color: var(--gris-300);
  border-top-color: var(--gris-600);
}
</style>
