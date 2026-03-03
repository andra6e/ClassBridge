const { z } = require('zod');

const esquemaChat = z.object({
  id_estudiante: z.number().int().positive('id_estudiante debe ser entero positivo'),
  id_sesion: z.number().int().positive('id_sesion debe ser entero positivo'),
  mensaje: z.string().min(3, 'El mensaje debe tener al menos 3 caracteres').max(2000, 'El mensaje no puede exceder 2000 caracteres'),
});

module.exports = { esquemaChat };
