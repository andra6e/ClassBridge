const { z } = require('zod');

const esquemaIniciarConversacion = z.object({
  id_estudiante: z.number().int().positive(),
  id_contenido: z.number().int().positive(),
});

const esquemaEnviarMensaje = z.object({
  id_conversacion: z.number().int().positive(),
  mensaje: z.string().min(1).max(2000),
});

module.exports = { esquemaIniciarConversacion, esquemaEnviarMensaje };
