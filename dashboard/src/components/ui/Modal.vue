<script setup>
defineProps({
  visible: { type: Boolean, required: true },
  titulo: { type: String, default: '' },
  ancho: { type: String, default: '480px' },
})

const emit = defineEmits(['cerrar'])
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-fondo">
        <div class="modal-caja" :style="{ maxWidth: ancho }">
          <div class="modal-cabecera">
            <h3 class="modal-titulo">{{ titulo }}</h3>
            <button class="modal-cerrar" @click="emit('cerrar')" aria-label="Cerrar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-cuerpo">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fondo {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  padding: 24px;
}

.modal-caja {
  background: white;
  border-radius: var(--radio-lg);
  box-shadow: var(--sombra-xl);
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-cabecera {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--gris-100);
}

.modal-titulo {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--gris-900);
  letter-spacing: -0.01em;
}

.modal-cerrar {
  background: none;
  border: none;
  color: var(--gris-400);
  padding: 4px;
  border-radius: 6px;
  transition: all var(--transicion);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-cerrar:hover {
  background: var(--gris-100);
  color: var(--gris-700);
}

.modal-cuerpo {
  padding: 20px 24px 24px;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 200ms ease;
}
.modal-enter-active .modal-caja,
.modal-leave-active .modal-caja {
  transition: transform 200ms ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-caja {
  transform: scale(0.95) translateY(10px);
}
.modal-leave-to .modal-caja {
  transform: scale(0.95) translateY(10px);
}
</style>
