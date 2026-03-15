const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
function manejadorErrores(err, _req, res, _next) {
  logger.error(err.message, { stack: err.stack });

  if (err.name === 'ZodError') {
    const problemas = err.issues || err.errors || [];
    const detalles = problemas.map((e) => ({
      campo: (e.path || []).join('.'),
      mensaje: e.message,
    }));
    return res.status(400).json({ ok: false, mensaje: 'Error de validacion', data: detalles });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ ok: false, mensaje: 'Registro duplicado', data: null });
  }

  if (err.name === 'SequelizeValidationError') {
    const detalles = (err.errors || []).map((e) => ({ campo: e.path, mensaje: e.message }));
    return res.status(400).json({ ok: false, mensaje: 'Error de validacion en BD', data: detalles });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ ok: false, mensaje: 'Token invalido o expirado', data: null });
  }

  if (err.name === 'SequelizeConnectionAcquireTimeoutError') {
    return res.status(503).json({
      ok: false,
      mensaje: 'Servidor ocupado. Espera unos segundos e intenta de nuevo.',
      data: null,
    });
  }

  const codigo = err.statusCode || 500;
  const mensaje = codigo === 500 ? 'Error interno del servidor' : err.message;
  return res.status(codigo).json({ ok: false, mensaje, data: null });
}

module.exports = manejadorErrores;
