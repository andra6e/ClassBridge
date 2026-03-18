import http from './http'

export default {
  estadisticasAdmin() { return http.get('/reportes/admin') },
  resumenDiario()     { return http.get('/reportes/resumen-diario') },
  resumenDiarioMaestro() { return http.get('/reportes/resumen-diario-maestro') },
}
