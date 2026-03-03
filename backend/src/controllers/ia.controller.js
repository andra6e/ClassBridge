const iaService = require('../services/ia.service');
const { exito, error } = require('../utils/response');

async function chat(req, res, next) {
  try {
    const { id_estudiante, id_sesion, mensaje } = req.body;

    const resultado = await iaService.generarRespuestaChat({
      id_padre: req.usuario.id,
      id_estudiante,
      id_sesion,
      mensaje,
    });

    if (resultado.error) {
      const msg = resultado.error;
      let codigo = 500;
      if (msg.includes('vinculado') || msg.includes('inscrito') || msg.includes('permiso')) codigo = 403;
      else if (msg.includes('no encontrad') || msg.includes('No hay contenido')) codigo = 404;
      else if (msg.includes('Error al generar')) codigo = 502;
      return error(res, msg, codigo);
    }

    return exito(res, resultado, 'Respuesta generada');
  } catch (err) {
    next(err);
  }
}

module.exports = { chat };
