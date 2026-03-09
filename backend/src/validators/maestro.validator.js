const { z } = require('zod');

const esquemaGuardarAsistencia = z.object({
  id_grado: z.number().int().positive(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  registros: z.array(
    z.object({
      id_estudiante: z.number().int().positive(),
      estado: z.enum(['presente', 'ausente']),
    })
  ).min(1),
});

const esquemaGuardarContenido = z.object({
  id_grado: z.number().int().positive(),
  id_materia: z.number().int().positive(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tema: z.string().min(3).max(200),
  explicacion: z.string().min(10),
  actividades: z.string().optional(),
});

module.exports = { esquemaGuardarAsistencia, esquemaGuardarContenido };
