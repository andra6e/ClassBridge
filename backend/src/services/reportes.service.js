const { Op, fn, col, literal } = require('sequelize');
const {
  Usuario, Estudiante, Matricula, Asistencia, Justificante,
  ContenidoClase, ConversacionIA, MensajeIA, Grado, AsignacionGrado,
} = require('../database');

async function obtenerEstadisticasAdmin() {
  const totalEstudiantes = await Estudiante.count({ where: { activo: true } });
  const totalMaestros = await Usuario.count({ where: { rol: 'maestro', activo: true } });
  const totalPadres = await Usuario.count({ where: { rol: 'padre', activo: true } });
  const totalMatriculas = await Matricula.count({ where: { estado: 'activa' } });

  const justPendientes = await Justificante.count({ where: { estado: 'pendiente' } });
  const justAprobados = await Justificante.count({ where: { estado: 'aprobado' } });
  const justRechazados = await Justificante.count({ where: { estado: 'rechazado' } });

  const totalPresentes = await Asistencia.count({ where: { estado: 'presente' } });
  const totalAusentes = await Asistencia.count({ where: { estado: 'ausente' } });
  const tasaAsistencia = (totalPresentes + totalAusentes) > 0
    ? Math.round((totalPresentes / (totalPresentes + totalAusentes)) * 100)
    : 0;

  const totalContenidos = await ContenidoClase.count();
  const totalConversacionesIA = await ConversacionIA.count();

  const asistenciaPorGrado = await Asistencia.findAll({
    attributes: [
      'id_grado',
      [fn('COUNT', col('id_asistencia')), 'total'],
      [fn('SUM', literal("CASE WHEN estado = 'presente' THEN 1 ELSE 0 END")), 'presentes'],
      [fn('SUM', literal("CASE WHEN estado = 'ausente' THEN 1 ELSE 0 END")), 'ausentes'],
    ],
    include: [{ association: 'grado', attributes: ['nombre'] }],
    group: ['id_grado', 'grado.id_grado'],
    raw: false,
  });

  const estudiantesPorGrado = await Matricula.findAll({
    where: { estado: 'activa' },
    attributes: [
      'id_grado',
      [fn('COUNT', col('id_matricula')), 'total'],
    ],
    include: [{ association: 'grado', attributes: ['nombre'] }],
    group: ['id_grado', 'grado.id_grado'],
    raw: false,
  });

  return {
    resumen: {
      totalEstudiantes,
      totalMaestros,
      totalPadres,
      totalMatriculas,
      tasaAsistencia,
      totalContenidos,
      totalConversacionesIA,
    },
    justificantes: { pendientes: justPendientes, aprobados: justAprobados, rechazados: justRechazados },
    asistenciaPorGrado: asistenciaPorGrado.map(a => ({
      grado: a.grado?.nombre || 'Sin grado',
      total: parseInt(a.getDataValue('total')) || 0,
      presentes: parseInt(a.getDataValue('presentes')) || 0,
      ausentes: parseInt(a.getDataValue('ausentes')) || 0,
    })),
    estudiantesPorGrado: estudiantesPorGrado.map(e => ({
      grado: e.grado?.nombre || 'Sin grado',
      total: parseInt(e.getDataValue('total')) || 0,
    })),
  };
}

async function obtenerResumenDiario() {
  const hoy = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const presentesHoy = await Asistencia.count({ where: { fecha: hoy, estado: 'presente' } });
  const ausentesHoy  = await Asistencia.count({ where: { fecha: hoy, estado: 'ausente' } });
  const totalHoy = presentesHoy + ausentesHoy;
  const tasaHoy  = totalHoy > 0 ? Math.round((presentesHoy / totalHoy) * 100) : null;

  const clasesHoy = await ContenidoClase.count({ where: { fecha: hoy } });

  const justHoy = await Justificante.count({
    include: [{
      association: 'asistencia',
      where: { fecha: hoy },
      attributes: [],
    }],
  });

  return {
    fecha: hoy,
    asistencia: { presentes: presentesHoy, ausentes: ausentesHoy, total: totalHoy, tasa: tasaHoy },
    clasesRegistradas: clasesHoy,
    justificantesEnviados: justHoy,
  };
}

async function obtenerResumenDiarioMaestro(idMaestro) {
  const hoy = new Date().toISOString().slice(0, 10);

  const asignacion = await AsignacionGrado.findOne({
    where: { id_maestro: idMaestro, activo: true },
    include: [{ association: 'grado', attributes: ['id_grado', 'nombre'] }],
  });

  if (!asignacion) {
    return {
      fecha: hoy,
      grado: null,
      anioEscolar: null,
      asistencia: { presentes: 0, ausentes: 0, total: 0, tasa: null },
      clasesRegistradas: 0,
      justificantesEnviados: 0,
      mensaje: 'No tienes grado asignado',
    };
  }

  const idGrado = asignacion.id_grado;

  const presentesHoy = await Asistencia.count({ where: { fecha: hoy, estado: 'presente', id_grado: idGrado } });
  const ausentesHoy = await Asistencia.count({ where: { fecha: hoy, estado: 'ausente', id_grado: idGrado } });
  const totalHoy = presentesHoy + ausentesHoy;
  const tasaHoy = totalHoy > 0 ? Math.round((presentesHoy / totalHoy) * 100) : null;

  const clasesHoy = await ContenidoClase.count({ where: { fecha: hoy, id_grado: idGrado } });

  const justHoy = await Justificante.count({
    include: [{
      association: 'asistencia',
      where: { fecha: hoy, id_grado: idGrado },
      attributes: [],
    }],
  });

  return {
    fecha: hoy,
    grado: {
      id_grado: asignacion.grado?.id_grado || idGrado,
      nombre: asignacion.grado?.nombre || null,
    },
    anioEscolar: asignacion.anio_escolar,
    asistencia: { presentes: presentesHoy, ausentes: ausentesHoy, total: totalHoy, tasa: tasaHoy },
    clasesRegistradas: clasesHoy,
    justificantesEnviados: justHoy,
  };
}

module.exports = { obtenerEstadisticasAdmin, obtenerResumenDiario, obtenerResumenDiarioMaestro };
