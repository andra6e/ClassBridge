const { z } = require('zod');

const esquemaCrearJustificante = z.object({
  id_asistencia: z.number().int().positive(),
  motivo: z.string().min(5),
  archivo: z.object({
    nombre: z.string().min(1),
    mime: z.string().min(1),
    base64: z.string().min(1),
  }).optional(),
});

const esquemaRevisarJustificante = z.object({
  estado: z.enum(['aprobado', 'rechazado']),
});

module.exports = { esquemaCrearJustificante, esquemaRevisarJustificante };
