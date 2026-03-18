<script setup>
import { computed, ref, watch } from 'vue'
import {
  PHONE_COUNTRIES,
  getCountryByIso,
  normalizeInternationalPhone,
  onlyDigits,
  maxDigitsByCountry,
  parseInternationalPhone,
  formatNationalPhone,
} from '../../utils/formValidations'

const props = defineProps({
  modelValue: { type: String, default: '' },
  etiqueta: { type: String, default: '' },
  error: { type: String, default: '' },
  deshabilitado: { type: Boolean, default: false },
  defaultCountry: { type: String, default: 'HN' },
})

const emit = defineEmits(['update:modelValue'])

const selectedIso = ref(getCountryByIso(props.defaultCountry).iso)
const nationalPhone = ref('')

const country = computed(() => getCountryByIso(selectedIso.value))
const placeholder = computed(() => {
  const ejemplo = country.value.grupos.map((g) => '0'.repeat(g)).join(' ')
  return `${country.value.nombre}: ${ejemplo}`
})

function emitValue() {
  const value = normalizeInternationalPhone(nationalPhone.value, selectedIso.value)
  emit('update:modelValue', value)
}

function syncFromModelValue(value) {
  if (!value) {
    selectedIso.value = getCountryByIso(props.defaultCountry).iso
    nationalPhone.value = ''
    return
  }

  const parsed = parseInternationalPhone(value)
  if (!parsed) return

  selectedIso.value = parsed.countryIso
  nationalPhone.value = formatNationalPhone(parsed.digits, parsed.countryIso)
}

function onCountryChange() {
  const max = maxDigitsByCountry(selectedIso.value)
  nationalPhone.value = formatNationalPhone(onlyDigits(nationalPhone.value).slice(0, max), selectedIso.value)
  emitValue()
}

function onPhoneInput(event) {
  const max = maxDigitsByCountry(selectedIso.value)
  const digits = onlyDigits(event.target.value).slice(0, max)
  nationalPhone.value = formatNationalPhone(digits, selectedIso.value)
  emitValue()
}

function onPhoneKeydown(event) {
  const teclasPermitidas = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'Home', 'End',
  ]

  if (teclasPermitidas.includes(event.key)) return
  if (event.ctrlKey || event.metaKey) return

  if (!/^\d$/.test(event.key)) {
    event.preventDefault()
  }
}

function onPhonePaste(event) {
  event.preventDefault()
  const pegado = event.clipboardData?.getData('text') || ''
  const max = maxDigitsByCountry(selectedIso.value)
  const digitsActuales = onlyDigits(nationalPhone.value)
  const soloPegado = onlyDigits(pegado)
  const combinado = (digitsActuales + soloPegado).slice(0, max)
  nationalPhone.value = formatNationalPhone(combinado, selectedIso.value)
  emitValue()
}

watch(() => props.modelValue, (nuevo) => {
  if (nuevo === normalizeInternationalPhone(nationalPhone.value, selectedIso.value)) return
  syncFromModelValue(nuevo)
}, { immediate: true })
</script>

<template>
  <div class="campo-grupo">
    <label v-if="etiqueta" class="campo-etiqueta">{{ etiqueta }}</label>
    <div class="telefono-fila" :class="{ 'telefono-fila-error': error }">
      <select v-model="selectedIso" class="telefono-select" :disabled="deshabilitado" @change="onCountryChange">
        <option v-for="pais in PHONE_COUNTRIES" :key="pais.iso" :value="pais.iso">{{ pais.iso }} +{{ pais.codigo }}</option>
      </select>
      <input
        type="tel"
        :value="nationalPhone"
        :placeholder="placeholder"
        :disabled="deshabilitado"
        class="telefono-input"
        inputmode="numeric"
        autocomplete="off"
        spellcheck="false"
        @input="onPhoneInput"
        @keydown="onPhoneKeydown"
        @paste="onPhonePaste"
      />
    </div>
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

.telefono-fila {
  display: grid;
  grid-template-columns: 110px 1fr;
  border: 1px solid var(--gris-300);
  border-radius: var(--radio-sm);
  overflow: hidden;
  transition: border-color var(--transicion), box-shadow var(--transicion);
  background: white;
}

.telefono-fila:focus-within {
  border-color: var(--primario);
  box-shadow: 0 0 0 3px var(--primario-claro);
}

.telefono-select,
.telefono-input {
  border: 0;
  padding: 9px 12px;
  font-size: 0.875rem;
  outline: none;
  background: transparent;
  color: var(--gris-800);
}

.telefono-select {
  border-right: 1px solid var(--gris-200);
  background: var(--gris-50);
}

.telefono-input::placeholder {
  color: var(--gris-400);
}

.telefono-fila-error {
  border-color: var(--peligro);
}

.telefono-fila-error:focus-within {
  box-shadow: 0 0 0 3px var(--peligro-claro);
}

.campo-error {
  font-size: 0.75rem;
  color: var(--peligro);
  font-weight: 500;
}
</style>
