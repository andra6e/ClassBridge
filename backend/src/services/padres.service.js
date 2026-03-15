const { Op } = require('sequelize');
const logger = require('../utils/logger');
const {
  Matricula, Asistencia, ContenidoClase, Justificante,
} = require('../database');

async function listarHijos(idPadre) {
  return Matricula.findAll({
    where: { id_padre: idPadre, estado: 'activa' },
    include: [
      { association: 'estudiante' },
      { association: 'grado' },
    ],
  });
}

async function historialAsistencia(idPadre, idEstudiante, limite = 50) {
  const vinculo = await Matricula.findOne({
    where: { id_padre: idPadre, id_estudiante: idEstudiante },
  });
  if (!vinculo) return { error: 'No tienes acceso a este estudiante' };

  return Asistencia.findAll({
    where: { id_estudiante: idEstudiante },
    include: [
      { association: 'grado' },
      { association: 'justificante' },
    ],
    order: [['fecha', 'DESC']],
    limit: limite,
  });
}

async function contenidoPendiente(idPadre, idEstudiante) {
  const vinculo = await Matricula.findOne({
    where: { id_padre: idPadre, id_estudiante: idEstudiante, estado: 'activa' },
  });
  if (!vinculo) return { error: 'No tienes acceso a este estudiante' };

  const ausencias = await Asistencia.findAll({
    where: { id_estudiante: idEstudiante, estado: 'ausente' },
    attributes: ['fecha', 'id_grado'],
  });

  if (!ausencias.length) return [];

  const fechas = ausencias.map((a) => a.fecha);
  const idGrado = vinculo.id_grado;

  const contenido = await ContenidoClase.findAll({
    where: {
      id_grado: idGrado,
      fecha: { [Op.in]: fechas },
    },
    include: [{ association: 'materia' }],
    order: [['fecha', 'DESC']],
  });

  return contenido;
}

async function listarNotificaciones(idPadre, limite = 30) {
  return Justificante.findAll({
    where: {
      enviado_por: idPadre,
      estado: { [Op.in]: ['aprobado', 'rechazado'] },
    },
    include: [{
      association: 'asistencia',
      include: [{ association: 'estudiante' }],
    }],
    order: [['revisado_en', 'DESC']],
    limit: limite,
  });
}

module.exports = {
  listarHijos,
  historialAsistencia,
  contenidoPendiente,
  listarNotificaciones,
};
