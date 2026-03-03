import http from './http'

export default {
  listarPendientes() {
    return http.get('/justificantes/pendientes')
  },
  revisar(idJustificante, estado, notasRevision) {
    return http.post(`/justificantes/${idJustificante}/revisar`, {
      estado,
      notas_revision: notasRevision || null,
    })
  },
}
