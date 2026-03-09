const logger = require('../utils/logger');
const { hashear } = require('../utils/hash');
const {
  Usuario, Estudiante, Grado, Matricula, AsignacionGrado,
} = require('../database');

async function listarMaestros() {
  return Usuario.findAll({
    where: { rol: 'maestro' },
    attributes: { exclude: ['hash_contrasena'] },
    include: [{ association: 'asignaciones', include: ['grado'] }],
  });
}

async function crearMaestro(datos) {
  const existe = await Usuario.findOne({ where: { correo: datos.correo } });
  if (existe) return { error: 'Ya existe un usuario con ese correo' };

  const hash_contrasena = await hashear(datos.contrasena);
  const maestro = await Usuario.create({
    nombre_completo: datos.nombre_completo,
    correo: datos.correo,
    hash_contrasena,
    rol: 'maestro',
    telefono: datos.telefono || null,
  });

  const { hash_contrasena: _, ...sinHash } = maestro.toJSON();
  return sinHash;
}

async function toggleMaestro(idUsuario, activo) {
  const maestro = await Usuario.findOne({ where: { id_usuario: idUsuario, rol: 'maestro' } });
  if (!maestro) return { error: 'Maestro no encontrado' };

  await maestro.update({ activo });
  return { id_usuario: maestro.id_usuario, activo: maestro.activo };
}

async function listarPadres() {
  return Usuario.findAll({
    where: { rol: 'padre' },
    attributes: { exclude: ['hash_contrasena'] },
  });
}

async function obtenerPadre(idUsuario) {
  const padre = await Usuario.findOne({
    where: { id_usuario: idUsuario, rol: 'padre' },
    attributes: { exclude: ['hash_contrasena'] },
    include: [{
      association: 'matriculasComoPadre',
      where: { estado: 'activa' },
      required: false,
      include: ['estudiante', 'grado'],
    }],
  });
  if (!padre) return { error: 'Padre no encontrado' };
  return padre;
}

async function crearPadre(datos) {
  const existe = await Usuario.findOne({ where: { correo: datos.correo } });
  if (existe) return { error: 'Ya existe un usuario con ese correo' };

  const hash_contrasena = await hashear(datos.contrasena);
  const padre = await Usuario.create({
    nombre_completo: datos.nombre_completo,
    correo: datos.correo,
    hash_contrasena,
    rol: 'padre',
    telefono: datos.telefono || null,
  });

  const { hash_contrasena: _, ...sinHash } = padre.toJSON();
  return sinHash;
}

async function listarEstudiantes() {
  return Estudiante.findAll({
    include: [{ association: 'matriculas', include: ['padre', 'grado'] }],
  });
}

async function crearEstudiante(datos) {
  return Estudiante.create(datos);
}

async function listarGrados() {
  return Grado.findAll({
    order: [['orden', 'ASC']],
    include: [{
      association: 'asignaciones',
      where: { activo: true },
      required: false,
      include: [{ association: 'maestro', attributes: ['id_usuario', 'nombre_completo', 'correo'] }],
    }],
  });
}

async function listarMatriculas(anio_escolar) {
  const where = anio_escolar ? { anio_escolar } : {};
  return Matricula.findAll({
    where,
    include: [
      { association: 'padre', attributes: { exclude: ['hash_contrasena'] } },
      'estudiante',
      'grado',
    ],
  });
}

async function registrarFamilia(datos) {
  const resultadoPadre = await crearPadre(datos.padre);
  if (resultadoPadre.error) return resultadoPadre;

  const idPadre = resultadoPadre.id_usuario;
  const anioEscolar = datos.anio_escolar;
  const estudiantesCreados = [];
  const matriculasCreadas = [];

  for (const est of datos.estudiantes) {
    const estudiante = await Estudiante.create({
      nombre_completo: est.nombre_completo,
      fecha_nacimiento: est.fecha_nacimiento || null,
      sexo: est.sexo || null,
    });

    const matricula = await Matricula.create({
      id_padre: idPadre,
      id_estudiante: estudiante.id_estudiante,
      id_grado: est.id_grado,
      anio_escolar: anioEscolar,
    });

    estudiantesCreados.push(estudiante);
    matriculasCreadas.push(await Matricula.findByPk(matricula.id_matricula, {
      include: [
        { association: 'padre', attributes: { exclude: ['hash_contrasena'] } },
        'estudiante',
        'grado',
      ],
    }));
  }

  return {
    padre: resultadoPadre,
    estudiantes: estudiantesCreados,
    matriculas: matriculasCreadas,
  };
}

async function crearMatricula(datos) {
  const existente = await Matricula.findOne({
    where: {
      id_estudiante: datos.id_estudiante,
      anio_escolar: datos.anio_escolar,
      estado: 'activa',
    },
  });
  if (existente) return { error: 'El estudiante ya esta matriculado en ese anio escolar' };

  const matricula = await Matricula.create(datos);
  return Matricula.findByPk(matricula.id_matricula, {
    include: ['padre', 'estudiante', 'grado'],
  });
}

async function crearAsignacion(datos) {
  const existente = await AsignacionGrado.findOne({
    where: {
      id_grado: datos.id_grado,
      anio_escolar: datos.anio_escolar,
      activo: true,
    },
  });
  if (existente) return { error: 'El grado ya tiene un maestro asignado para ese anio' };

  const asignacion = await AsignacionGrado.create(datos);
  return AsignacionGrado.findByPk(asignacion.id_asignacion, {
    include: ['maestro', 'grado'],
  });
}

async function eliminarAsignacion(idAsignacion) {
  const asignacion = await AsignacionGrado.findByPk(idAsignacion);
  if (!asignacion) return { error: 'Asignacion no encontrada' };

  await asignacion.destroy();
  return { eliminado: true };
}

async function promocionIndividual(idMatricula, nuevoIdGrado) {
  const matricula = await Matricula.findByPk(idMatricula);
  if (!matricula) return { error: 'Matricula no encontrada' };

  await matricula.update({ id_grado: nuevoIdGrado });
  return Matricula.findByPk(idMatricula, {
    include: ['padre', 'estudiante', 'grado'],
  });
}

async function promocionGrado(idGradoOrigen, anio_escolar) {
  const gradoOrigen = await Grado.findByPk(idGradoOrigen);
  if (!gradoOrigen) return { error: 'Grado origen no encontrado' };

  const matriculas = await Matricula.findAll({
    where: { id_grado: idGradoOrigen, anio_escolar, estado: 'activa' },
  });
  if (!matriculas.length) return { error: 'No hay matriculas activas para ese grado y anio' };

  const gradoSiguiente = await Grado.findOne({
    where: { orden: gradoOrigen.orden + 1 },
  });

  let count = 0;
  for (const mat of matriculas) {
    if (!gradoSiguiente) {
      await mat.update({ estado: 'graduada' });
    } else {
      await mat.update({ id_grado: gradoSiguiente.id_grado });
    }
    count++;
  }

  logger.info('Promocion de grado completada', { idGradoOrigen, count, graduados: !gradoSiguiente });
  return { promovidos: count, graduados: !gradoSiguiente };
}

module.exports = {
  listarMaestros,
  crearMaestro,
  registrarFamilia,
  toggleMaestro,
  listarPadres,
  obtenerPadre,
  crearPadre,
  listarEstudiantes,
  crearEstudiante,
  listarGrados,
  listarMatriculas,
  crearMatricula,
  crearAsignacion,
  eliminarAsignacion,
  promocionIndividual,
  promocionGrado,
};
