const rateLimit = require('express-rate-limit');

const limitadorAuthConfig = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, mensaje: 'Demasiados intentos de autenticacion. Espera 1 minuto.', data: null },
});

const limitadorAuth = (req, res, next) => {
  if (process.env.NODE_ENV !== 'production') return next();
  limitadorAuthConfig(req, res, next);
};

const limitadorIA = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, mensaje: 'Demasiadas solicitudes al chat IA. Espera un momento.', data: null },
});

module.exports = { limitadorAuth, limitadorIA };
