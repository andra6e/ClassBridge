import http from './http'

export default {
  // Maestros
  listarMaestros: () => http.get('/admin/maestros'),
  crearMaestro: (datos) => http.post('/admin/maestros', datos),
  cambiarEstadoMaestro: (id, activo) => http.patch(`/admin/maestros/${id}/estado`, { activo }),

  // Grupos
  listarGrupos: () => http.get('/admin/grupos'),
  crearGrupo: (datos) => http.post('/admin/grupos', datos),
  asignarMaestro: (idGrupo, idMaestro) => http.patch(`/admin/grupos/${idGrupo}/asignar-maestro`, { id_maestro: idMaestro }),

  // Estudiantes
  listarEstudiantes: (busqueda) => http.get('/admin/estudiantes', { params: { busqueda } }),
  crearEstudiante: (datos) => http.post('/admin/estudiantes', datos),
  cambiarEstadoEstudiante: (id, activo) => http.patch(`/admin/estudiantes/${id}/estado`, { activo }),

  // Matriculas
  listarInscritos: (idGrupo) => http.get(`/admin/grupos/${idGrupo}/inscritos`),
  matricularEstudiante: (idGrupo, idEstudiante) => http.post('/admin/matriculas', { id_grupo: idGrupo, id_estudiante: idEstudiante }),
  retirarEstudiante: (idGrupo, idEstudiante) => http.patch('/admin/matriculas/retirar', { id_grupo: idGrupo, id_estudiante: idEstudiante }),

  // Padres
  crearPadre: (datos) => http.post('/admin/padres', datos),
  vincularPadreEstudiante: (datos) => http.post('/admin/vincular-padre-estudiante', datos),
}
