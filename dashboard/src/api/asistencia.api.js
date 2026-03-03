import http from './http'

export default {
  guardar(idGrupo, fechaSesion, registros) {
    return http.post('/asistencia/guardar', {
      id_grupo: idGrupo,
      fecha_sesion: fechaSesion,
      registros,
    })
  },
}
