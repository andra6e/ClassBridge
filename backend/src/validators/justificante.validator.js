const { z } = require('zod');

const esquemaCrearJustificante = z.object({
  id_asistencia: z.number().int().positive('id_asistencia debe ser entero positivo'),
  motivo: z.string().min(1, 'El motivo es requerido'),
  url_adjunto: z.string().url().nullable().optional(),
  nombre_adjunto: z.string().max(255).nullable().optional(),
});

const esquemaRevisarJustificante = z.object({
  estado: z.enum(['aprobado', 'rechazado'], { message: 'Estado debe ser aprobado o rechazado' }),
  notas_revision: z.string().nullable().optional(),
});

module.exports = { esquemaCrearJustificante, esquemaRevisarJustificante };
