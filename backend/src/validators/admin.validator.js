const { z } = require('zod');

const esquemaCrearMaestro = z.object({
  nombre_completo: z.string().min(3, 'Minimo 3 caracteres').max(150),
  correo: z.string().email('Correo no valido'),
  contrasena: z.string().min(6, 'Minimo 6 caracteres').max(100),
  telefono: z.string().max(20).nullable().optional(),
});

const esquemaCambiarEstado = z.object({
  activo: z.boolean({ required_error: 'activo es requerido' }),
});

const esquemaCrearGrupo = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100),
  materia: z.string().max(100).nullable().optional(),
  nivel_grado: z.string().max(30).nullable().optional(),
  anio_escolar: z.string().max(20).nullable().optional(),
  id_maestro: z.number().int().positive('id_maestro debe ser entero positivo'),
});

const esquemaAsignarMaestro = z.object({
  id_maestro: z.number().int().positive('id_maestro debe ser entero positivo'),
});

const esquemaCrearEstudiante = z.object({
  nombre_completo: z.string().min(3, 'Minimo 3 caracteres').max(150),
  codigo_matricula: z.string().max(50).nullable().optional(),
  fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD').nullable().optional(),
  sexo: z.enum(['M', 'F', 'O']).nullable().optional(),
  nivel_grado: z.string().max(30).nullable().optional(),
});

const esquemaMatricula = z.object({
  id_grupo: z.number().int().positive('id_grupo requerido'),
  id_estudiante: z.number().int().positive('id_estudiante requerido'),
});

const esquemaCrearPadre = z.object({
  nombre_completo: z.string().min(3, 'Minimo 3 caracteres').max(150),
  correo: z.string().email('Correo no valido'),
  contrasena: z.string().min(6, 'Minimo 6 caracteres').max(100),
  telefono: z.string().max(20).nullable().optional(),
});

const esquemaVincularPadre = z.object({
  id_padre: z.number().int().positive('id_padre requerido'),
  id_estudiante: z.number().int().positive('id_estudiante requerido'),
  relacion: z.string().max(30).default('padre').optional(),
  es_principal: z.boolean().default(false).optional(),
});

module.exports = {
  esquemaCrearMaestro,
  esquemaCambiarEstado,
  esquemaCrearGrupo,
  esquemaAsignarMaestro,
  esquemaCrearEstudiante,
  esquemaMatricula,
  esquemaCrearPadre,
  esquemaVincularPadre,
};
