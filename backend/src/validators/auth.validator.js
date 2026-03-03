const { z } = require('zod');

const esquemaLogin = z.object({
  correo: z.string().email('Correo invalido'),
  contrasena: z.string().min(1, 'La contrasena es requerida'),
});

const esquemaRefresh = z.object({
  refresh_token: z.string().min(1, 'El refresh token es requerido'),
});

module.exports = { esquemaLogin, esquemaRefresh };
