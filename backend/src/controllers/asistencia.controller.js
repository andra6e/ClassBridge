const asistenciaService = require('../services/asistencia.service');
const { exito, error } = require('../utils/response');

async function guardarAsistencia(req, res, next) {
  try {
    const { id_grupo, fecha_sesion, registros } = req.body;
    const resultado = await asistenciaService.guardarAsistenciaMasiva({
      id_usuario: req.usuario.id,
      id_grupo,
      fecha_sesion,
      registros,
    });

    if (resultado.error) return error(res, resultado.error, 403);
    return exito(res, resultado, 'Asistencia guardada');
  } catch (err) { next(err); }
}

module.exports = { guardarAsistencia };
