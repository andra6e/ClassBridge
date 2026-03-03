const { Op } = require('sequelize');
const { hashear } = require('../utils/hash');
const {
  Usuario,
  GrupoClase,
  Estudiante,
  InscripcionGrupo,
  Padre,
  PadreEstudiante,
} = require('../database');

// ───────────────── MAESTROS ─────────────────

async function listarMaestros(idEscuela) {
  return Usuario.findAll({
    where: { id_escuela: idEscuela, rol: 'maestro' },
    attributes: { exclude: ['hash_contrasena'] },
    order: [['nombre_completo', 'ASC']],
  });
}

async function crearMaestro(idEscuela, datos) {
  const existente = await Usuario.findOne({ where: { correo: datos.correo } });
  if (existente) return { error: 'Ya existe un usuario con ese correo' };

  const hash = await hashear(datos.contrasena);
  const maestro = await Usuario.create({
    id_escuela: idEscuela,
    nombre_completo: datos.nombre_completo,
    correo: datos.correo,
    hash_contrasena: hash,
    rol: 'maestro',
    telefono: datos.telefono || null,
  });

  const { hash_contrasena, ...sinHash } = maestro.toJSON();
  return { maestro: sinHash };
}

async function cambiarEstadoMaestro(idEscuela, idUsuario, activo) {
  const maestro = await Usuario.findOne({
    where: { id_usuario: idUsuario, id_escuela: idEscuela, rol: 'maestro' },
  });
  if (!maestro) return { error: 'Maestro no encontrado en tu escuela' };
  await maestro.update({ activo });
  return { maestro: { id_usuario: maestro.id_usuario, activo: maestro.activo } };
}

// ───────────────── GRUPOS ─────────────────

async function listarGrupos(idEscuela) {
  return GrupoClase.findAll({
    where: { id_escuela: idEscuela },
    include: [{
      association: 'maestro',
      attributes: ['id_usuario', 'nombre_completo', 'correo'],
    }],
    order: [['nombre', 'ASC']],
  });
}

async function crearGrupo(idEscuela, datos) {
  const maestro = await Usuario.findOne({
    where: { id_usuario: datos.id_maestro, id_escuela: idEscuela, rol: 'maestro' },
  });
  if (!maestro) return { error: 'Maestro no encontrado o no pertenece a tu escuela' };

  const grupo = await GrupoClase.create({
    id_escuela: idEscuela,
    nombre: datos.nombre,
    materia: datos.materia || null,
    nivel_grado: datos.nivel_grado || null,
    anio_escolar: datos.anio_escolar || null,
    id_maestro: datos.id_maestro,
  });

  return { grupo };
}

async function asignarMaestro(idEscuela, idGrupo, idMaestro) {
  const grupo = await GrupoClase.findOne({
    where: { id_grupo: idGrupo, id_escuela: idEscuela },
  });
  if (!grupo) return { error: 'Grupo no encontrado en tu escuela' };

  const maestro = await Usuario.findOne({
    where: { id_usuario: idMaestro, id_escuela: idEscuela, rol: 'maestro' },
  });
  if (!maestro) return { error: 'Maestro no encontrado o no pertenece a tu escuela' };

  await grupo.update({ id_maestro: idMaestro });
  return { grupo };
}

// ───────────────── ESTUDIANTES ─────────────────

async function listarEstudiantes(idEscuela, busqueda) {
  const where = { id_escuela: idEscuela };
  if (busqueda) {
    where[Op.or] = [
      { nombre_completo: { [Op.like]: `%${busqueda}%` } },
      { codigo_matricula: { [Op.like]: `%${busqueda}%` } },
    ];
  }
  return Estudiante.findAll({ where, order: [['nombre_completo', 'ASC']] });
}

async function crearEstudiante(idEscuela, datos) {
  const estudiante = await Estudiante.create({
    id_escuela: idEscuela,
    nombre_completo: datos.nombre_completo,
    codigo_matricula: datos.codigo_matricula || null,
    fecha_nacimiento: datos.fecha_nacimiento || null,
    sexo: datos.sexo || null,
    nivel_grado: datos.nivel_grado || null,
  });
  return { estudiante };
}

async function cambiarEstadoEstudiante(idEscuela, idEstudiante, activo) {
  const est = await Estudiante.findOne({
    where: { id_estudiante: idEstudiante, id_escuela: idEscuela },
  });
  if (!est) return { error: 'Estudiante no encontrado en tu escuela' };
  await est.update({ activo });
  return { estudiante: { id_estudiante: est.id_estudiante, activo: est.activo } };
}

// ───────────────── MATRICULAS ─────────────────

async function listarInscritos(idEscuela, idGrupo) {
  const grupo = await GrupoClase.findOne({
    where: { id_grupo: idGrupo, id_escuela: idEscuela },
  });
  if (!grupo) return { error: 'Grupo no encontrado en tu escuela' };

  const inscritos = await InscripcionGrupo.findAll({
    where: { id_grupo: idGrupo, retirado_en: null },
    include: [{
      model: Estudiante,
      as: 'estudiante',
      attributes: ['id_estudiante', 'nombre_completo', 'codigo_matricula', 'nivel_grado', 'activo'],
    }],
  });
  return { inscritos };
}

async function matricularEstudiante(idEscuela, idGrupo, idEstudiante) {
  const grupo = await GrupoClase.findOne({
    where: { id_grupo: idGrupo, id_escuela: idEscuela },
  });
  if (!grupo) return { error: 'Grupo no encontrado en tu escuela' };

  const est = await Estudiante.findOne({
    where: { id_estudiante: idEstudiante, id_escuela: idEscuela },
  });
  if (!est) return { error: 'Estudiante no encontrado en tu escuela' };

  const existente = await InscripcionGrupo.findOne({
    where: { id_grupo: idGrupo, id_estudiante: idEstudiante, retirado_en: null },
  });
  if (existente) return { error: 'El estudiante ya esta inscrito en este grupo' };

  const retirado = await InscripcionGrupo.findOne({
    where: { id_grupo: idGrupo, id_estudiante: idEstudiante },
  });
  if (retirado) {
    await retirado.update({ retirado_en: null, inscrito_en: new Date() });
    return { inscripcion: retirado };
  }

  const inscripcion = await InscripcionGrupo.create({
    id_grupo: idGrupo,
    id_estudiante: idEstudiante,
  });
  return { inscripcion };
}

async function retirarEstudiante(idEscuela, idGrupo, idEstudiante) {
  const grupo = await GrupoClase.findOne({
    where: { id_grupo: idGrupo, id_escuela: idEscuela },
  });
  if (!grupo) return { error: 'Grupo no encontrado en tu escuela' };

  const inscripcion = await InscripcionGrupo.findOne({
    where: { id_grupo: idGrupo, id_estudiante: idEstudiante, retirado_en: null },
  });
  if (!inscripcion) return { error: 'El estudiante no esta inscrito en este grupo' };

  await inscripcion.update({ retirado_en: new Date() });
  return { inscripcion };
}

// ───────────────── PADRES ─────────────────

async function crearPadre(idEscuela, datos) {
  const existente = await Padre.findOne({ where: { correo: datos.correo } });
  if (existente) return { error: 'Ya existe un padre con ese correo' };

  const hash = await hashear(datos.contrasena);
  const padre = await Padre.create({
    id_escuela: idEscuela,
    nombre_completo: datos.nombre_completo,
    correo: datos.correo,
    hash_contrasena: hash,
    telefono: datos.telefono || null,
  });

  const { hash_contrasena, ...sinHash } = padre.toJSON();
  return { padre: sinHash };
}

async function vincularPadreEstudiante(idEscuela, datos) {
  const padre = await Padre.findOne({
    where: { id_padre: datos.id_padre, id_escuela: idEscuela },
  });
  if (!padre) return { error: 'Padre no encontrado en tu escuela' };

  const est = await Estudiante.findOne({
    where: { id_estudiante: datos.id_estudiante, id_escuela: idEscuela },
  });
  if (!est) return { error: 'Estudiante no encontrado en tu escuela' };

  const existente = await PadreEstudiante.findOne({
    where: { id_padre: datos.id_padre, id_estudiante: datos.id_estudiante },
  });
  if (existente) return { error: 'Este vinculo ya existe' };

  const vinculo = await PadreEstudiante.create({
    id_padre: datos.id_padre,
    id_estudiante: datos.id_estudiante,
    relacion: datos.relacion || 'padre',
    es_principal: datos.es_principal || false,
  });
  return { vinculo };
}

module.exports = {
  listarMaestros,
  crearMaestro,
  cambiarEstadoMaestro,
  listarGrupos,
  crearGrupo,
  asignarMaestro,
  listarEstudiantes,
  crearEstudiante,
  cambiarEstadoEstudiante,
  listarInscritos,
  matricularEstudiante,
  retirarEstudiante,
  crearPadre,
  vincularPadreEstudiante,
};
