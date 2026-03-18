import http from './http'

export default {
  estadisticasAdmin() { return http.get('/reportes/admin') },
  resumenDiario()     { return http.get('/reportes/resumen-diario') },
  resumenDiarioMaestro(params = {}) { return http.get('/reportes/resumen-diario-maestro', { params }) },
  moduloAdmin(params = {}) { return http.get('/reportes/admin/modulo', { params }) },
  moduloMaestro(params = {}) { return http.get('/reportes/maestro/modulo', { params }) },
}
