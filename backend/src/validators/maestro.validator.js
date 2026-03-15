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
  tipo_contenido: z.enum(['materia', 'general']).optional(),
  id_materia: z.number().int().positive().optional(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tema: z.string().min(3).max(200),
  explicacion: z.string().min(10),
  actividades: z.string().optional(),
  archivo: z.object({
    nombre: z.string().min(1),
    mime: z.string().min(1),
    base64: z.string().min(1),
  }).optional(),
}).refine((data) => {
  const tipo = data.tipo_contenido || 'materia';
  if (tipo === 'general') return true;
  return !!data.id_materia;
}, {
  message: 'id_materia es obligatorio cuando el contenido es por materia',
  path: ['id_materia'],
});

module.exports = { esquemaGuardarAsistencia, esquemaGuardarContenido };
