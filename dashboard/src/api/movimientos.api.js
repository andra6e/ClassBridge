import http from './http'

export default {
  listarMios(limite = 20) {
    return http.get('/movimientos/mios', { params: { limite } })
  },
}
