const { z } = require('zod');

const esquemaGuardarAsistencia = z.object({
  id_grupo: z.number().int().positive('id_grupo debe ser entero positivo'),
  fecha_sesion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'fecha_sesion debe ser YYYY-MM-DD'),
  registros: z.array(
    z.object({
      id_estudiante: z.number().int().positive(),
      estado: z.enum(['presente', 'ausente', 'tarde', 'justificado']),
      notas: z.string().max(500).nullable().optional(),
    })
  ).min(1, 'Debe incluir al menos un registro'),
});

module.exports = { esquemaGuardarAsistencia };
