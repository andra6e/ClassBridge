import http from './http'

export default {
  guardar(idSesion, titulo, resumen, notasExtra) {
    return http.post('/contenido', {
      id_sesion: idSesion,
      titulo,
      resumen,
      notas_extra: notasExtra || null,
    })
  },
}
