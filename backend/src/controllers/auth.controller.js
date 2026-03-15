const authService = require('../services/auth.service');
const { exito, error } = require('../utils/response');

async function login(req, res, next) {
  try {
    const resultado = await authService.loginUsuario(req.body.correo, req.body.contrasena);
    if (resultado.error) return error(res, resultado.error, 400);
    return exito(res, resultado, 'Login exitoso');
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const resultado = await authService.refreshToken(req.body.refresh_token);
    if (resultado.error) return error(res, resultado.error, 401);
    return exito(res, resultado, 'Token renovado');
  } catch (err) {
    next(err);
  }
}

async function logout(req, res) {
  return exito(res, null, 'Sesion cerrada');
}

async function verificarContrasena(req, res, next) {
  try {
    const resultado = await authService.verificarContrasena(req.usuario.id, req.body.contrasena);
    if (resultado.error) return error(res, resultado.error, 403);
    return exito(res, { verificado: true }, 'Contrasena verificada');
  } catch (err) {
    next(err);
  }
}

module.exports = { login, refresh, logout, verificarContrasena };
