import http from './http'

export default {
  obtenerMisGrados() { return http.get('/maestro/mis-grados') },
  obtenerMiGrado() { return http.get('/maestro/mi-grado') },
  listarEstudiantes(params) { return http.get('/maestro/estudiantes', { params }) },
  guardarAsistencia(datos) { return http.post('/maestro/asistencia', datos) },
  obtenerAsistencia(params) { return http.get('/maestro/asistencia', { params }) },
  guardarContenido(datos) { return http.post('/maestro/contenido', datos) },
  listarContenido(params) { return http.get('/maestro/contenido', { params }) },
}
