const jwt = require('jsonwebtoken');

const ACCESS_SECRET = () => process.env.ACCESS_TOKEN_SECRET || 'classbridge_access_dev';

function autenticar(req, res, next) {
  const cabecera = req.headers.authorization;
  if (!cabecera || !cabecera.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, mensaje: 'Token no proporcionado', data: null });
  }

  const token = cabecera.split(' ')[1];
  try {
    const payload = jwt.verify(token, ACCESS_SECRET());
    req.usuario = payload;
    return next();
  } catch (err) {
    const mensaje = err.name === 'TokenExpiredError' ? 'Token expirado' : 'Token invalido';
    return res.status(401).json({ ok: false, mensaje, data: null });
  }
}

module.exports = { autenticar };
