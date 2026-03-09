const { z } = require('zod');

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
  telefono: z.string().optional(),
});

const esquemaCrearEstudiante = z.object({
  nombre_completo: z.string().min(3),
  fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sexo: z.enum(['M', 'F']).optional(),
});

const esquemaCrearMatricula = z.object({
  id_padre: z.number().int().positive(),
  id_estudiante: z.number().int().positive(),
  id_grado: z.number().int().positive(),
  anio_escolar: z.string().regex(/^\d{4}-\d{4}$/),
});

const esquemaCrearAsignacion = z.object({
  id_maestro: z.number().int().positive(),
  id_grado: z.number().int().positive(),
  anio_escolar: z.string().regex(/^\d{4}-\d{4}$/),
});

const esquemaPromocionIndividual = z.object({
  id_matricula: z.number().int().positive(),
  nuevo_id_grado: z.number().int().positive(),
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
  esquemaCrearEstudiante,
  esquemaCrearMatricula,
  esquemaCrearAsignacion,
  esquemaPromocionIndividual,
  esquemaPromocionGrado,
  esquemaRegistrarFamilia,
};
