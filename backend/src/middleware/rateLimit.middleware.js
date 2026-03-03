const rateLimit = require('express-rate-limit');

const limitadorAuth = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, mensaje: 'Demasiados intentos de autenticacion. Espera 1 minuto.', data: null },
});

const limitadorIA = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, mensaje: 'Demasiadas solicitudes al chat IA. Espera un momento.', data: null },
});

module.exports = { limitadorAuth, limitadorIA };
