const logger = require('../utils/logger');
const {
  Justificante, Asistencia, Matricula, AsignacionGrado,
} = require('../database');
const { guardarArchivoBase64 } = require('../utils/file-storage');
const { registrarMovimiento } = require('./movimientos.service');

async function crearJustificante({ id_asistencia, motivo, archivo, enviado_por }) {
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

  const archivoGuardado = guardarArchivoBase64({
    carpetaRelativa: 'justificantes',
    archivo,
  });

  const justificante = await Justificante.create({
    id_asistencia,
    motivo,
    enviado_por,
    archivo_nombre: archivoGuardado?.nombre || null,
    archivo_url: archivoGuardado?.url || null,
    archivo_mime: archivoGuardado?.mime || null,
  });

  await registrarMovimiento({
    id_usuario: enviado_por,
    rol: 'padre',
    accion: 'justificante_enviado',
    detalle: `Justificante enviado para asistencia ${id_asistencia}`,
  });

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
  const asignacion = await AsignacionGrado.findOne({ where: { id_maestro: idMaestro, activo: true } });
  if (!asignacion) return { error: 'No tienes grado asignado' };

  const justificante = await Justificante.findByPk(idJustificante, {
    include: [{ association: 'asistencia' }],
  });
  if (!justificante) return { error: 'Justificante no encontrado' };
  if (justificante.asistencia.id_grado !== asignacion.id_grado) {
    return { error: 'No tienes acceso a este justificante' };
  }
  if (justificante.estado !== 'pendiente') return { error: 'El justificante ya fue revisado' };

  await justificante.update({
    estado,
    revisado_por: idMaestro,
    revisado_en: new Date(),
  });

  logger.info('Justificante revisado', { idJustificante, estado });
  await registrarMovimiento({
    id_usuario: idMaestro,
    rol: 'maestro',
    accion: `justificante_${estado}`,
    detalle: `Justificante ${idJustificante} marcado como ${estado}`,
  });
  return justificante;
}

async function listarHistorial(idMaestro, estado) {
  const asignacion = await AsignacionGrado.findOne({
    where: { id_maestro: idMaestro, activo: true },
  });
  if (!asignacion) return { error: 'No tienes grado asignado' };

  const where = { revisado_por: idMaestro };
  if (estado && ['aprobado', 'rechazado'].includes(estado)) where.estado = estado;

  return Justificante.findAll({
    where,
    include: [
      {
        association: 'asistencia',
        where: { id_grado: asignacion.id_grado },
        include: [{ association: 'estudiante' }],
      },
      { association: 'emisor', attributes: ['id_usuario', 'nombre_completo'] },
      { association: 'revisor', attributes: ['id_usuario', 'nombre_completo'] },
    ],
    order: [['revisado_en', 'DESC']],
  });
}

module.exports = { crearJustificante, listarPendientes, revisarJustificante, listarHistorial };
