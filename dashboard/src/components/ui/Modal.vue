<script setup>
defineProps({
  visible: { type: Boolean, required: true },
  titulo: { type: String, default: '' },
})

const emit = defineEmits(['cerrar'])
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-fondo" @click.self="emit('cerrar')">
      <div class="modal-caja">
        <div class="modal-cabecera">
          <h3 class="modal-titulo">{{ titulo }}</h3>
          <button class="modal-cerrar" @click="emit('cerrar')">&times;</button>
        </div>
        <div class="modal-cuerpo">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-fondo {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-caja {
  background: white;
  border-radius: var(--radio);
  box-shadow: var(--sombra-md);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-cabecera {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--gris-200);
}

.modal-titulo {
  font-size: 1.1rem;
  font-weight: 600;
}

.modal-cerrar {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--gris-400);
  line-height: 1;
}
.modal-cerrar:hover { color: var(--gris-700); }

.modal-cuerpo {
  padding: 20px;
}
</style>
