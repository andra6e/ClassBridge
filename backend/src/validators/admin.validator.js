const { z } = require('zod');

const telefonoSchema = z.string().regex(/^[+]?[- 0-9]{7,20}$/);

const esquemaCrearMaestro = z.object({
  nombre_completo: z.string().min(3),
  correo: z.string().email(),
  contrasena: z.string().min(6),
  telefono: z.string().optional(),
});

const esquemaCrearPadre = z.object({
  nombre_completo: z.string().min(3),
  correo: z.string().email(),
  contrasena: z.string().min(6),
  telefono: telefonoSchema.optional(),
});

const esquemaActualizarPadre = z.object({
  nombre_completo: z.string().min(3).optional(),
  correo: z.string().email().optional(),
  telefono: telefonoSchema.optional().or(z.literal('')),
  activo: z.boolean().optional(),
});

const esquemaCrearEstudiante = z.object({
  nombre_completo: z.string().min(3),
  fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sexo: z.enum(['M', 'F']).optional(),
});

const esquemaActualizarEstudiante = z.object({
  nombre_completo: z.string().min(3).optional(),
  fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  sexo: z.enum(['M', 'F']).optional().or(z.literal('')),
  activo: z.boolean().optional(),
});

const esquemaCrearMatricula = z.object({
  id_padre: z.number().int().positive(),
  id_estudiante: z.number().int().positive(),
  id_grado: z.number().int().positive(),
  anio_escolar: z.string().regex(/^\d{4}-\d{4}$/),
});

const esquemaActualizarMatricula = z.object({
  id_padre: z.number().int().positive().optional(),
  id_estudiante: z.number().int().positive().optional(),
  id_grado: z.number().int().positive().optional(),
  anio_escolar: z.string().regex(/^\d{4}-\d{4}$/).optional(),
  estado: z.enum(['activa', 'retirada', 'graduada']).optional(),
});

const esquemaCrearAsignacion = z.object({
  id_maestro: z.number().int().positive(),
  id_grado: z.number().int().positive(),
  anio_escolar: z.string().regex(/^\d{4}-\d{4}$/),
});

const esquemaPromocionIndividual = z.object({
  id_matricula: z.number().int().positive(),
  nuevo_id_grado: z.number().int().positive().optional(),
  id_grado: z.number().int().positive().optional(),
}).refine((data) => data.nuevo_id_grado || data.id_grado, {
  message: 'Debes enviar nuevo_id_grado o id_grado',
  path: ['nuevo_id_grado'],
});

const esquemaPromocionGrado = z.object({
  id_grado: z.number().int().positive(),
  anio_escolar: z.string().regex(/^\d{4}-\d{4}$/),
});

const esquemaRegistrarFamilia = z.object({
  padre: z.object({
    nombre_completo: z.string().min(3),
    correo: z.string().email(),
    contrasena: z.string().min(6),
    telefono: z.string().optional(),
  }),
  anio_escolar: z.string().regex(/^\d{4}-\d{4}$/),
  estudiantes: z.array(z.object({
    nombre_completo: z.string().min(3),
    fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    sexo: z.enum(['M', 'F']).optional(),
    id_grado: z.coerce.number().int().positive(),
  })).min(1),
});

module.exports = {
  esquemaCrearMaestro,
  esquemaCrearPadre,
  esquemaActualizarPadre,
  esquemaCrearEstudiante,
  esquemaActualizarEstudiante,
  esquemaCrearMatricula,
  esquemaActualizarMatricula,
  esquemaCrearAsignacion,
  esquemaPromocionIndividual,
  esquemaPromocionGrado,
  esquemaRegistrarFamilia,
};
