const authService = require('../services/auth.service');
const { exito, error } = require('../utils/response');

async function login(req, res, next) {
  try {
    const resultado = await authService.loginUsuario(req.body.correo, req.body.contrasena);
    if (resultado.error) return error(res, resultado.error, 401);
    return exito(res, resultado, 'Login exitoso');
  } catch (err) { next(err); }
}

async function loginPadre(req, res, next) {
  try {
    const resultado = await authService.loginPadre(req.body.correo, req.body.contrasena);
    if (resultado.error) return error(res, resultado.error, 401);
    return exito(res, resultado, 'Login exitoso');
  } catch (err) { next(err); }
}

async function refresh(req, res, next) {
  try {
    const resultado = authService.refreshToken(req.body.refresh_token);
    if (resultado.error) return error(res, resultado.error, 401);
    return exito(res, resultado, 'Token renovado');
  } catch (err) { next(err); }
}

async function logout(req, res, next) {
  try {
    const { refresh_token } = req.body;
    if (refresh_token) authService.logout(refresh_token);
    return exito(res, null, 'Sesion cerrada');
  } catch (err) { next(err); }
}

module.exports = { login, loginPadre, refresh, logout };
