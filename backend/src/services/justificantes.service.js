const logger = require('../utils/logger');
const {
  Justificante, Asistencia, Matricula, AsignacionGrado,
} = require('../database');

async function crearJustificante({ id_asistencia, motivo, enviado_por }) {
  const asistencia = await Asistencia.findByPk(id_asistencia, {
    include: [{ association: 'estudiante' }],
  });
  if (!asistencia) return { error: 'Registro de asistencia no encontrado' };
  if (asistencia.estado !== 'ausente') return { error: 'Solo se puede justificar una ausencia' };

  const vinculo = await Matricula.findOne({
    where: { id_padre: enviado_por, id_estudiante: asistencia.id_estudiante },
  });
  if (!vinculo) return { error: 'No tienes acceso a este estudiante' };

  const existente = await Justificante.findOne({ where: { id_asistencia } });
  if (existente) return { error: 'Ya existe un justificante para esta asistencia' };

  const justificante = await Justificante.create({ id_asistencia, motivo, enviado_por });

  return Justificante.findByPk(justificante.id_justificante, {
    include: [
      { association: 'asistencia', include: [{ association: 'estudiante' }] },
      { association: 'emisor', attributes: ['id_usuario', 'nombre_completo'] },
    ],
  });
}

async function listarPendientes(idMaestro) {
  const asignacion = await AsignacionGrado.findOne({
    where: { id_maestro: idMaestro, activo: true },
  });
  if (!asignacion) return { error: 'No tienes grado asignado' };

  return Justificante.findAll({
    where: { estado: 'pendiente' },
    include: [{
      association: 'asistencia',
      where: { id_grado: asignacion.id_grado },
      include: [{ association: 'estudiante' }],
    }, {
      association: 'emisor',
      attributes: ['id_usuario', 'nombre_completo'],
    }],
  });
}

async function revisarJustificante(idJustificante, idMaestro, estado) {
  const justificante = await Justificante.findByPk(idJustificante);
  if (!justificante) return { error: 'Justificante no encontrado' };
  if (justificante.estado !== 'pendiente') return { error: 'El justificante ya fue revisado' };

  await justificante.update({
    estado,
    revisado_por: idMaestro,
    revisado_en: new Date(),
  });

  logger.info('Justificante revisado', { idJustificante, estado });
  return justificante;
}

module.exports = { crearJustificante, listarPendientes, revisarJustificante };
