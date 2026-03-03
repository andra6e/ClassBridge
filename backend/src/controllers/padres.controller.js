const padresService = require('../services/padres.service');
const estudiantesService = require('../services/estudiantes.service');
const { exito, error } = require('../utils/response');

async function listarEstudiantes(req, res, next) {
  try {
    const resultado = await padresService.listarEstudiantesDelPadre(req.usuario.id);
    if (resultado.error) return error(res, resultado.error, 404);
    return exito(res, resultado.estudiantes, 'Hijos del padre');
  } catch (err) { next(err); }
}

async function historialAsistencia(req, res, next) {
  try {
    const id_estudiante = parseInt(req.params.id_estudiante, 10);
    if (isNaN(id_estudiante)) return error(res, 'id_estudiante invalido', 400);

    const limite = parseInt(req.query.limite, 10) || 50;
    const resultado = await estudiantesService.obtenerHistorialAsistenciaPadre(
      req.usuario.id, id_estudiante, limite
    );

    if (resultado.error) return error(res, resultado.error, 403);
    return exito(res, resultado.asistencias, 'Historial de asistencia');
  } catch (err) { next(err); }
}

module.exports = { listarEstudiantes, historialAsistencia };
