<script setup>
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  etiqueta: { type: String, default: '' },
  tipo: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  deshabilitado: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

function onInput(e) {
  emit('update:modelValue', e.target.value)
}
</script>

<template>
  <div class="campo-grupo">
    <label v-if="etiqueta" class="campo-etiqueta">{{ etiqueta }}</label>
    <input
      :type="tipo"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="deshabilitado"
      class="campo-input"
      :class="{ 'campo-input-error': error }"
      @input="onInput"
    />
    <span v-if="error" class="campo-error">{{ error }}</span>
  </div>
</template>

<style scoped>
.campo-grupo {
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
  padding: 9px 12px;
  border: 1px solid var(--gris-300);
  background: white;
  border-radius: var(--radio-sm);
  font-size: 0.875rem;
  outline: none;
  transition: border-color var(--transicion), box-shadow var(--transicion);
  color: var(--gris-800);
}

.campo-input::placeholder {
  color: var(--gris-400);
}

.campo-input:focus {
  border-color: var(--primario);
  box-shadow: 0 0 0 3px var(--primario-claro);
}

.campo-input:disabled {
  background: var(--gris-100);
  cursor: not-allowed;
  color: var(--gris-500);
}

.campo-input-error {
  border-color: var(--peligro);
}

.campo-input-error:focus {
  box-shadow: 0 0 0 3px var(--peligro-claro);
}

.campo-error {
  font-size: 0.75rem;
  color: var(--peligro);
  font-weight: 500;
}
</style>
