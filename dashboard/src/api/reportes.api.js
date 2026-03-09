import http from './http'

export default {
  estadisticasAdmin() { return http.get('/reportes/admin') },
}
