import http from './http'

export default {
  listarPendientes() { return http.get('/justificantes/pendientes') },
  listarHistorial(params) { return http.get('/justificantes/historial', { params }) },
  revisar(id, estado) { return http.patch(`/justificantes/${id}/revisar`, { estado }) },
}
