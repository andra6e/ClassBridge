const logger = require('../utils/logger');
const { Op } = require('sequelize');
const { hashear } = require('../utils/hash');
const {
  Usuario, Estudiante, Grado, Matricula, AsignacionGrado,
} = require('../database');
const { registrarMovimiento } = require('./movimientos.service');

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

async function listarPadres({ q, estado, estudiante } = {}) {
  const where = { rol: 'padre' };
  if (estado === 'activo') where.activo = true;
  if (estado === 'inactivo') where.activo = false;
  if (q) {
    where[Op.or] = [
      { nombre_completo: { [Op.like]: `%${q}%` } },
      { correo: { [Op.like]: `%${q}%` } },
      { telefono: { [Op.like]: `%${q}%` } },
    ];
  }

  const filtroEstudiante = estudiante ? {
    association: 'matriculasComoPadre',
    include: [{ association: 'estudiante', where: { nombre_completo: { [Op.like]: `%${estudiante}%` } } }],
    required: true,
  } : {
    association: 'matriculasComoPadre',
    include: [{ association: 'estudiante' }],
    required: false,
  };

  return Usuario.findAll({
    where,
    attributes: { exclude: ['hash_contrasena'] },
    include: [filtroEstudiante],
    order: [['nombre_completo', 'ASC']],
    distinct: true,
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
  await registrarMovimiento({
    id_usuario: padre.id_usuario,
    rol: 'padre',
    accion: 'padre_creado',
    detalle: `Padre creado: ${padre.nombre_completo}`,
  });
  return sinHash;
}

async function actualizarPadre(idUsuario, datos) {
  const padre = await Usuario.findOne({ where: { id_usuario: idUsuario, rol: 'padre' } });
  if (!padre) return { error: 'Padre no encontrado' };

  if (datos.correo && datos.correo !== padre.correo) {
    const existe = await Usuario.findOne({ where: { correo: datos.correo } });
    if (existe) return { error: 'Ya existe un usuario con ese correo' };
  }

  const payload = {
    nombre_completo: datos.nombre_completo ?? padre.nombre_completo,
    correo: datos.correo ?? padre.correo,
    telefono: datos.telefono === '' ? null : (datos.telefono ?? padre.telefono),
  };
  if (typeof datos.activo === 'boolean') payload.activo = datos.activo;

  await padre.update(payload);
  await registrarMovimiento({
    id_usuario: padre.id_usuario,
    rol: 'padre',
    accion: 'padre_actualizado',
    detalle: `Padre actualizado: ${padre.nombre_completo}`,
  });

  const { hash_contrasena: _, ...sinHash } = padre.toJSON();
  return sinHash;
}

async function eliminarPadre(idUsuario) {
  const padre = await Usuario.findOne({ where: { id_usuario: idUsuario, rol: 'padre' } });
  if (!padre) return { error: 'Padre no encontrado' };
  await padre.destroy();
  await registrarMovimiento({
    id_usuario: idUsuario,
    rol: 'padre',
    accion: 'padre_eliminado',
    detalle: `Padre eliminado: ${padre.nombre_completo}`,
  });
  return { eliminado: true };
}

async function listarEstudiantes({ id_grado, id_padre, estado } = {}) {
  const where = {};
  if (estado === 'activo') where.activo = true;
  if (estado === 'inactivo') where.activo = false;

  const whereMatricula = {};
  if (id_grado) whereMatricula.id_grado = Number(id_grado);
  if (id_padre) whereMatricula.id_padre = Number(id_padre);

  return Estudiante.findAll({
    where,
    include: [{
      association: 'matriculas',
      where: Object.keys(whereMatricula).length ? whereMatricula : undefined,
      required: !!Object.keys(whereMatricula).length,
      include: ['padre', 'grado'],
    }],
    order: [['nombre_completo', 'ASC']],
  });
}

async function crearEstudiante(datos) {
  return Estudiante.create(datos);
}

async function actualizarEstudiante(idEstudiante, datos) {
  const estudiante = await Estudiante.findByPk(idEstudiante);
  if (!estudiante) return { error: 'Estudiante no encontrado' };

  await estudiante.update({
    nombre_completo: datos.nombre_completo ?? estudiante.nombre_completo,
    fecha_nacimiento: datos.fecha_nacimiento === '' ? null : (datos.fecha_nacimiento ?? estudiante.fecha_nacimiento),
    sexo: datos.sexo === '' ? null : (datos.sexo ?? estudiante.sexo),
    activo: typeof datos.activo === 'boolean' ? datos.activo : estudiante.activo,
  });

  return estudiante;
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

async function obtenerMatricula(idMatricula) {
  const matricula = await Matricula.findByPk(idMatricula, {
    include: [
      { association: 'padre', attributes: { exclude: ['hash_contrasena'] } },
      'estudiante',
      'grado',
    ],
  });
  if (!matricula) return { error: 'Matricula no encontrada' };
  return matricula;
}

async function actualizarMatricula(idMatricula, datos) {
  const matricula = await Matricula.findByPk(idMatricula);
  if (!matricula) return { error: 'Matricula no encontrada' };

  const payload = {
    id_padre: datos.id_padre ?? matricula.id_padre,
    id_estudiante: datos.id_estudiante ?? matricula.id_estudiante,
    id_grado: datos.id_grado ?? matricula.id_grado,
    anio_escolar: datos.anio_escolar ?? matricula.anio_escolar,
    estado: datos.estado ?? matricula.estado,
  };

  await matricula.update(payload);

  return Matricula.findByPk(idMatricula, {
    include: ['padre', 'estudiante', 'grado'],
  });
}

async function eliminarMatricula(idMatricula) {
  const matricula = await Matricula.findByPk(idMatricula);
  if (!matricula) return { error: 'Matricula no encontrada' };
  await matricula.destroy();
  return { eliminado: true };
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
    },
  });

  if (existente) {
    await existente.update({
      id_maestro: datos.id_maestro,
      activo: true,
    });
    return AsignacionGrado.findByPk(existente.id_asignacion, {
      include: ['maestro', 'grado'],
    });
  }

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
  actualizarPadre,
  eliminarPadre,
  listarEstudiantes,
  crearEstudiante,
  actualizarEstudiante,
  listarGrados,
  listarMatriculas,
  obtenerMatricula,
  actualizarMatricula,
  eliminarMatricula,
  crearMatricula,
  crearAsignacion,
  eliminarAsignacion,
  promocionIndividual,
  promocionGrado,
};
