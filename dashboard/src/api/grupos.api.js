import http from './http'

export default {
  listarGrupos() {
    return http.get('/grupos')
  },
  listarEstudiantes(idGrupo) {
    return http.get(`/grupos/${idGrupo}/estudiantes`)
  },
}
