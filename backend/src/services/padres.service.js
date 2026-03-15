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
  const matriculas = await Matricula.findAll({
    where: { id_padre: idPadre },
    attributes: ['id_estudiante'],
  });
  const idsEstudiantes = matriculas.map((m) => m.id_estudiante).filter(Boolean);
  if (idsEstudiantes.length === 0) return [];

  const [justificantes, asistenciasRecientes] = await Promise.all([
    Justificante.findAll({
      where: {
        enviado_por: idPadre,
        estado: { [Op.in]: ['aprobado', 'rechazado'] },
        revisado_en: { [Op.ne]: null },
      },
      include: [{
        association: 'asistencia',
        include: [{ association: 'estudiante' }],
      }],
      order: [['revisado_en', 'DESC']],
      limit: limite,
    }),
    Asistencia.findAll({
      where: {
        id_estudiante: { [Op.in]: idsEstudiantes },
        fecha: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) },
      },
      include: [
        { association: 'estudiante', attributes: ['id_estudiante', 'nombre_completo'] },
        { association: 'grado', attributes: ['id_grado', 'nombre'] },
      ],
      order: [['fecha', 'DESC']],
      limit: 50,
    }),
  ]);

  const items = [];
  justificantes.forEach((j) => {
    const plain = j.get ? j.get({ plain: true }) : j;
    items.push({
      tipo: 'justificante',
      fecha_orden: plain.revisado_en || plain.createdAt,
      id_justificante: plain.id_justificante,
      estado: plain.estado,
      revisado_en: plain.revisado_en,
      asistencia: plain.asistencia,
    });
  });
  asistenciasRecientes.forEach((a) => {
    const plain = a.get ? a.get({ plain: true }) : a;
    items.push({
      tipo: 'asistencia',
      fecha_orden: plain.fecha,
      id_asistencia: plain.id_asistencia,
      fecha: plain.fecha,
      estado: plain.estado,
      estudiante: plain.estudiante,
      grado: plain.grado,
    });
  });

  items.sort((a, b) => {
    const dA = new Date(a.fecha_orden || 0);
    const dB = new Date(b.fecha_orden || 0);
    return dB - dA;
  });
  return items.slice(0, limite);
}

module.exports = {
  listarHijos,
  historialAsistencia,
  contenidoPendiente,
  listarNotificaciones,
};
