import http from './http'

export default {
  listarMaestros() { return http.get('/admin/maestros') },
  crearMaestro(datos) { return http.post('/admin/maestros', datos) },
  toggleMaestro(id, activo) { return http.patch(`/admin/maestros/${id}`, { activo }) },
  listarPadres() { return http.get('/admin/padres') },
  obtenerPadre(id) { return http.get(`/admin/padres/${id}`) },
  crearPadre(datos) { return http.post('/admin/padres', datos) },
  listarEstudiantes() { return http.get('/admin/estudiantes') },
  crearEstudiante(datos) { return http.post('/admin/estudiantes', datos) },
  listarGrados() { return http.get('/admin/grados') },
  listarMatriculas(anio) { return http.get('/admin/matriculas', { params: { anio_escolar: anio } }) },
  crearMatricula(datos) { return http.post('/admin/matriculas', datos) },
  registrarFamilia(datos) { return http.post('/admin/familias', datos) },
  crearAsignacion(datos) { return http.post('/admin/asignaciones', datos) },
  eliminarAsignacion(id) { return http.delete(`/admin/asignaciones/${id}`) },
  promocionIndividual(datos) { return http.post('/admin/promocion/individual', datos) },
  promocionGrado(datos) { return http.post('/admin/promocion/grado', datos) },
}
