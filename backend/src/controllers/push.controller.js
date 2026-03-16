const pushService = require('../services/push.service');
const { exito, error } = require('../utils/response');

async function registrarToken(req, res, next) {
  try {
    const resultado = await pushService.registrarToken({
      id_usuario: req.usuario.id,
      rol: req.usuario.rol,
      token: req.body.token,
      plataforma: req.body.plataforma || 'android',
    });
    if (resultado.error) return error(res, resultado.error, 400);
    return exito(res, resultado, 'Token push registrado');
  } catch (err) {
    return next(err);
  }
}

async function eliminarToken(req, res, next) {
  try {
    const resultado = await pushService.eliminarToken({
      id_usuario: req.usuario.id,
      token: req.body.token,
    });
    if (resultado.error) return error(res, resultado.error, 400);
    return exito(res, resultado, 'Token push eliminado');
  } catch (err) {
    return next(err);
  }
}

module.exports = { registrarToken, eliminarToken };
