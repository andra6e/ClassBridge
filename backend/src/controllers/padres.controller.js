const padresService = require('../services/padres.service');
const { exito, error } = require('../utils/response');

async function listarHijos(req, res, next) {
  try {
    const resultado = await padresService.listarHijos(req.usuario.id);
    return exito(res, resultado, 'Hijos listados');
  } catch (err) { next(err); }
}

async function historialAsistencia(req, res, next) {
  try {
    const resultado = await padresService.historialAsistencia(
      req.usuario.id,
      parseInt(req.params.id_estudiante, 10),
      req.query.limite ? parseInt(req.query.limite, 10) : undefined,
    );
    if (resultado.error) return error(res, resultado.error, 403);
    return exito(res, resultado, 'Historial de asistencia obtenido');
  } catch (err) { next(err); }
}

async function contenidoPendiente(req, res, next) {
  try {
    const resultado = await padresService.contenidoPendiente(
      req.usuario.id,
      parseInt(req.params.id_estudiante, 10),
    );
    if (resultado.error) return error(res, resultado.error, 403);
    return exito(res, resultado, 'Contenido pendiente obtenido');
  } catch (err) { next(err); }
}

async function listarNotificaciones(req, res, next) {
  try {
    const limite = req.query.limite ? parseInt(req.query.limite, 10) : 30;
    const resultado = await padresService.listarNotificaciones(req.usuario.id, limite);
    return exito(res, resultado, 'Notificaciones obtenidas');
  } catch (err) { next(err); }
}

module.exports = {
  listarHijos,
  historialAsistencia,
  contenidoPendiente,
  listarNotificaciones,
};
