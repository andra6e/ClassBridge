import http from './http'

export default {
  login(correo, contrasena) {
    return http.post('/auth/login', { correo, contrasena })
  },
  refresh(refreshToken) {
    return http.post('/auth/refresh', { refresh_token: refreshToken })
  },
  logout() {
    const refreshToken = localStorage.getItem('cb_refresh')
    return http.post('/auth/logout', { refresh_token: refreshToken })
  },
}
