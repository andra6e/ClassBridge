const iaService = require('../services/ia.service');
const { exito, error } = require('../utils/response');

async function iniciarConversacion(req, res, next) {
  try {
    const resultado = await iaService.iniciarObtenerConversacion({
      id_estudiante: req.body.id_estudiante,
      id_contenido: req.body.id_contenido,
      id_padre: req.usuario.id,
    });
    if (resultado.error) return error(res, resultado.error, 400);
    return exito(res, resultado, 'Conversacion obtenida');
  } catch (err) { next(err); }
}

async function enviarMensaje(req, res, next) {
  try {
    const resultado = await iaService.enviarMensaje({
      id_conversacion: req.body.id_conversacion,
      mensaje: req.body.mensaje,
      id_padre: req.usuario.id,
    });
    if (resultado.error) return error(res, resultado.error, 400);
    return exito(res, resultado, 'Mensaje enviado');
  } catch (err) { next(err); }
}

async function listarConversaciones(req, res, next) {
  try {
    const resultado = await iaService.listarConversaciones(parseInt(req.params.id_estudiante, 10));
    return exito(res, resultado, 'Conversaciones listadas');
  } catch (err) { next(err); }
}

module.exports = { iniciarConversacion, enviarMensaje, listarConversaciones };
