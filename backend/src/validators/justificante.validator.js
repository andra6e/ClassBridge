const { z } = require('zod');

const esquemaCrearJustificante = z.object({
  id_asistencia: z.number().int().positive(),
  motivo: z.string().min(5),
});

const esquemaRevisarJustificante = z.object({
  estado: z.enum(['aprobado', 'rechazado']),
});

module.exports = { esquemaCrearJustificante, esquemaRevisarJustificante };
