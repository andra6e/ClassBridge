const { z } = require('zod');

const esquemaContenido = z.object({
  id_sesion: z.number().int().positive('id_sesion debe ser entero positivo'),
  titulo: z.string().min(1, 'El titulo es requerido').max(200),
  resumen: z.string().min(1, 'El resumen es requerido'),
  notas_extra: z.string().nullable().optional(),
});

const esquemaAdjunto = z.object({
  id_contenido: z.number().int().positive('id_contenido debe ser entero positivo'),
  nombre_archivo: z.string().min(1, 'nombre_archivo es requerido').max(255),
  tipo_archivo: z.string().min(1, 'tipo_archivo es requerido').max(100),
  url_archivo: z.string().url('url_archivo debe ser una URL valida'),
  tamano_kb: z.number().int().positive().nullable().optional(),
});

module.exports = { esquemaContenido, esquemaAdjunto };
