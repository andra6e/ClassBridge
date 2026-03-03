const jwt = require('jsonwebtoken');
const { comparar } = require('../utils/hash');
const { Usuario, Padre } = require('../database');

const ACCESS_SECRET = () => process.env.ACCESS_TOKEN_SECRET || 'classbridge_access_dev';
const REFRESH_SECRET = () => process.env.REFRESH_TOKEN_SECRET || 'classbridge_refresh_dev';
const ACCESS_EXPIRA = '15m';
const REFRESH_EXPIRA = '7d';

// TODO: migrar a tabla auth_tokens en una fase posterior
const refreshTokensActivos = new Set();

function generarTokens(payload) {
  const accessToken = jwt.sign(payload, ACCESS_SECRET(), { expiresIn: ACCESS_EXPIRA });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET(), { expiresIn: REFRESH_EXPIRA });
  refreshTokensActivos.add(refreshToken);
  return { accessToken, refreshToken };
}

async function loginUsuario(correo, contrasena) {
  const usuario = await Usuario.findOne({ where: { correo, activo: true } });
  if (!usuario) return { error: 'Credenciales incorrectas' };

  const coincide = await comparar(contrasena, usuario.hash_contrasena);
  if (!coincide) return { error: 'Credenciales incorrectas' };

  await usuario.update({ ultimo_login_en: new Date() });

  const payload = {
    id: usuario.id_usuario,
    rol: usuario.rol,
    tipoActor: 'usuario',
    id_escuela: usuario.id_escuela,
  };

  const tokens = generarTokens(payload);

  return {
    tokens,
    usuario: {
      id_usuario: usuario.id_usuario,
      nombre_completo: usuario.nombre_completo,
      correo: usuario.correo,
      rol: usuario.rol,
      id_escuela: usuario.id_escuela,
    },
  };
}

async function loginPadre(correo, contrasena) {
  const padre = await Padre.findOne({ where: { correo, activo: true } });
  if (!padre) return { error: 'Credenciales incorrectas' };

  const coincide = await comparar(contrasena, padre.hash_contrasena);
  if (!coincide) return { error: 'Credenciales incorrectas' };

  await padre.update({ ultimo_login_en: new Date() });

  const payload = {
    id: padre.id_padre,
    rol: 'padre',
    tipoActor: 'padre',
    id_escuela: padre.id_escuela,
  };

  const tokens = generarTokens(payload);

  return {
    tokens,
    padre: {
      id_padre: padre.id_padre,
      nombre_completo: padre.nombre_completo,
      correo: padre.correo,
      id_escuela: padre.id_escuela,
    },
  };
}

function refreshToken(token) {
  if (!refreshTokensActivos.has(token)) {
    return { error: 'Refresh token no reconocido o revocado' };
  }

  try {
    const payload = jwt.verify(token, REFRESH_SECRET());
    refreshTokensActivos.delete(token);

    const nuevoPayload = {
      id: payload.id,
      rol: payload.rol,
      tipoActor: payload.tipoActor,
      id_escuela: payload.id_escuela,
    };

    return { tokens: generarTokens(nuevoPayload) };
  } catch {
    refreshTokensActivos.delete(token);
    return { error: 'Refresh token invalido o expirado' };
  }
}

function logout(token) {
  refreshTokensActivos.delete(token);
}

module.exports = {
  loginUsuario,
  loginPadre,
  refreshToken,
  logout,
};
