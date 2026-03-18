export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/

export const PHONE_COUNTRIES = [
  { iso: 'HN', nombre: 'Honduras', codigo: '504', grupos: [4, 4] },
  { iso: 'MX', nombre: 'México', codigo: '52', grupos: [3, 3, 4] },
  { iso: 'GT', nombre: 'Guatemala', codigo: '502', grupos: [4, 4] },
  { iso: 'SV', nombre: 'El Salvador', codigo: '503', grupos: [4, 4] },
  { iso: 'US', nombre: 'Estados Unidos', codigo: '1', grupos: [3, 3, 4] },
  { iso: 'CO', nombre: 'Colombia', codigo: '57', grupos: [3, 3, 4] },
  { iso: 'AR', nombre: 'Argentina', codigo: '54', grupos: [3, 3, 4] },
  { iso: 'ES', nombre: 'España', codigo: '34', grupos: [3, 3, 3] },
]

export function normalizeSpaces(texto = '') {
  return String(texto).replace(/\s+/g, ' ').trim()
}

export function sanitizeName(texto = '') {
  return normalizeSpaces(String(texto).replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]/g, ''))
}

export function isValidName(texto = '', min = 3) {
  const limpio = normalizeSpaces(texto)
  return limpio.length >= min && NAME_REGEX.test(limpio)
}

export function isValidEmail(correo = '') {
  return EMAIL_REGEX.test(String(correo).trim())
}

export function onlyDigits(texto = '') {
  return String(texto).replace(/\D/g, '')
}

export function getCountryByIso(iso = 'HN') {
  return PHONE_COUNTRIES.find((pais) => pais.iso === iso) || PHONE_COUNTRIES[0]
}

export function getCountryByDialCode(codigo = '') {
  return PHONE_COUNTRIES.find((pais) => pais.codigo === codigo) || null
}

export function maxDigitsByCountry(countryIso = 'HN') {
  const country = getCountryByIso(countryIso)
  return country.grupos.reduce((acc, n) => acc + n, 0)
}

export function formatNationalPhone(digits = '', countryIso = 'HN') {
  const country = getCountryByIso(countryIso)
  const max = maxDigitsByCountry(countryIso)
  const limpio = onlyDigits(digits).slice(0, max)

  const partes = []
  let inicio = 0
  for (const largo of country.grupos) {
    const parte = limpio.slice(inicio, inicio + largo)
    if (!parte) break
    partes.push(parte)
    inicio += largo
  }
  return partes.join(' ')
}

export function normalizeInternationalPhone(digits = '', countryIso = 'HN') {
  const country = getCountryByIso(countryIso)
  const nacional = formatNationalPhone(digits, countryIso)
  return nacional ? `+${country.codigo} ${nacional}` : ''
}

export function parseInternationalPhone(valor = '') {
  const limpio = String(valor || '').trim()
  if (!limpio.startsWith('+')) return null

  const solo = `+${limpio.slice(1).replace(/[^\d]/g, '')}`
  const sinMas = solo.slice(1)

  const ordenados = [...PHONE_COUNTRIES].sort((a, b) => b.codigo.length - a.codigo.length)
  for (const pais of ordenados) {
    if (sinMas.startsWith(pais.codigo)) {
      const nacional = sinMas.slice(pais.codigo.length)
      return {
        countryIso: pais.iso,
        digits: nacional,
      }
    }
  }
  return null
}

export function isPhoneComplete(digits = '', countryIso = 'HN') {
  return onlyDigits(digits).length === maxDigitsByCountry(countryIso)
}

export function isValidInternationalPhone(valor = '') {
  const parsed = parseInternationalPhone(valor)
  if (!parsed) return false
  return isPhoneComplete(parsed.digits, parsed.countryIso)
}
