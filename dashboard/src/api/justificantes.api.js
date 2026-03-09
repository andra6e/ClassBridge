import http from './http'

export default {
  listarPendientes() { return http.get('/justificantes/pendientes') },
  revisar(id, estado) { return http.patch(`/justificantes/${id}/revisar`, { estado }) },
}
