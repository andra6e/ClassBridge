const { z } = require('zod');

const esquemaLogin = z.object({
  correo: z.string().email('Correo invalido'),
  contrasena: z.string().min(1, 'Contrasena requerida'),
});

const esquemaRefresh = z.object({
  refresh_token: z.string().min(1, 'Refresh token requerido'),
});

const esquemaVerificarContrasena = z.object({
  contrasena: z.string().min(1, 'Contrasena requerida'),
});

module.exports = { esquemaLogin, esquemaRefresh, esquemaVerificarContrasena };
