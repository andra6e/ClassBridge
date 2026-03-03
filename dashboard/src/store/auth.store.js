import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authApi from '../api/auth.api'

export const useAuthStore = defineStore('auth', () => {
  const usuario = ref(JSON.parse(localStorage.getItem('cb_usuario') || 'null'))
  const token = ref(localStorage.getItem('cb_token') || null)

  const estaAutenticado = computed(() => !!token.value)
  const nombreUsuario = computed(() => usuario.value?.nombre_completo || '')
  const rolUsuario = computed(() => usuario.value?.rol || '')

  async function login(correo, contrasena) {
    const { data } = await authApi.login(correo, contrasena)
    token.value = data.data.tokens.accessToken
    usuario.value = data.data.usuario

    localStorage.setItem('cb_token', token.value)
    localStorage.setItem('cb_usuario', JSON.stringify(usuario.value))
    localStorage.setItem('cb_refresh', data.data.tokens.refreshToken)

    return data
  }

  function logout() {
    token.value = null
    usuario.value = null
    localStorage.removeItem('cb_token')
    localStorage.removeItem('cb_usuario')
    localStorage.removeItem('cb_refresh')
  }

  return { usuario, token, estaAutenticado, nombreUsuario, rolUsuario, login, logout }
})
