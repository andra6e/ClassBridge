const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { comparar } = require('../utils/hash');
const { Usuario } = require('../database');

async function loginUsuario(correo, contrasena) {
  try {
    const usuario = await Usuario.findOne({ where: { correo, activo: true } });
    if (!usuario) return { error: 'Credenciales invalidas' };

    const coincide = await comparar(contrasena, usuario.hash_contrasena);
    if (!coincide) return { error: 'Credenciales invalidas' };

    const payload = { id: usuario.id_usuario, rol: usuario.rol };

    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    await usuario.update({ ultimo_login_en: new Date() });

    logger.info('Login exitoso', { id: usuario.id_usuario, rol: usuario.rol });

    return {
      tokens: { accessToken, refreshToken },
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre_completo: usuario.nombre_completo,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    };
  } catch (err) {
    logger.error('Error en loginUsuario', err);
    return { error: 'Error interno al iniciar sesion' };
  }
}

async function verificarContrasena(idUsuario, contrasena) {
  try {
    const usuario = await Usuario.findByPk(idUsuario);
    if (!usuario) return { error: 'Usuario no encontrado' };

    const coincide = await comparar(contrasena, usuario.hash_contrasena);
    if (!coincide) return { error: 'Contraseña incorrecta' };

    return { ok: true };
  } catch (err) {
    logger.error('Error en verificarContrasena', err);
    return { error: 'Error al verificar contrasena' };
  }
}

async function refreshToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const payload = { id: decoded.id, rol: decoded.rol };

    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    const newRefresh = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    return { tokens: { accessToken, refreshToken: newRefresh } };
  } catch (err) {
    logger.error('Error en refreshToken', err);
    return { error: 'Token invalido o expirado' };
  }
}

module.exports = { loginUsuario, refreshToken, verificarContrasena };
