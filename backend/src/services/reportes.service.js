const { Op, fn, col, literal } = require('sequelize');
const {
  Usuario, Estudiante, Matricula, Asistencia, Justificante,
  ContenidoClase, ConversacionIA, MensajeIA, Grado, AsignacionGrado,
} = require('../database');

function ymd(fecha) {
  return new Date(fecha).toISOString().slice(0, 10);
}

function rangoFechas(desde, hasta) {
  const inicio = new Date(`${desde}T00:00:00`);
  const fin = new Date(`${hasta}T00:00:00`);
  const dias = [];
  const actual = new Date(inicio);
  while (actual <= fin) {
    dias.push(ymd(actual));
    actual.setDate(actual.getDate() + 1);
  }
  return dias;
}

function resolverRango({ desde, hasta, diasDefault = 30 } = {}) {
  const hoy = new Date();
  const fin = hasta ? new Date(`${hasta}T00:00:00`) : new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const ini = desde
    ? new Date(`${desde}T00:00:00`)
    : new Date(fin.getFullYear(), fin.getMonth(), fin.getDate() - (diasDefault - 1));

  const desdeYmd = ymd(ini);
  const hastaYmd = ymd(fin);
  return {
    desde: desdeYmd,
    hasta: hastaYmd,
    whereFecha: { [Op.between]: [desdeYmd, hastaYmd] },
  };
}

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

async function obtenerResumenDiarioMaestro(idMaestro, idGradoSeleccionado = null) {
  const hoy = new Date().toISOString().slice(0, 10);

  const whereAsignacion = { id_maestro: idMaestro, activo: true };
  if (idGradoSeleccionado) whereAsignacion.id_grado = idGradoSeleccionado;

  const asignacion = await AsignacionGrado.findOne({
    where: whereAsignacion,
    include: [{ association: 'grado', attributes: ['id_grado', 'nombre'] }],
    order: [['id_grado', 'ASC']],
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

async function obtenerModuloReportesAdmin({ desde, hasta } = {}) {
  const rango = resolverRango({ desde, hasta, diasDefault: 30 });

  const presentes = await Asistencia.count({ where: { fecha: rango.whereFecha, estado: 'presente' } });
  const ausentes = await Asistencia.count({ where: { fecha: rango.whereFecha, estado: 'ausente' } });
  const total = presentes + ausentes;

  const asistenciaSerieRaw = await Asistencia.findAll({
    where: { fecha: rango.whereFecha },
    attributes: [
      'fecha',
      [fn('SUM', literal("CASE WHEN estado = 'presente' THEN 1 ELSE 0 END")), 'presentes'],
      [fn('SUM', literal("CASE WHEN estado = 'ausente' THEN 1 ELSE 0 END")), 'ausentes'],
    ],
    group: ['fecha'],
    order: [['fecha', 'ASC']],
    raw: true,
  });

  const mapaSerie = Object.fromEntries(asistenciaSerieRaw.map((f) => [
    ymd(f.fecha),
    {
      presentes: parseInt(f.presentes, 10) || 0,
      ausentes: parseInt(f.ausentes, 10) || 0,
    },
  ]));

  const asistenciaSerie = rangoFechas(rango.desde, rango.hasta).map((fecha) => ({
    fecha,
    presentes: mapaSerie[fecha]?.presentes || 0,
    ausentes: mapaSerie[fecha]?.ausentes || 0,
  }));

  const justificantesPendientes = await Justificante.count({ where: { estado: 'pendiente' } });
  const justificantesAprobados = await Justificante.count({ where: { estado: 'aprobado' } });
  const justificantesRechazados = await Justificante.count({ where: { estado: 'rechazado' } });

  const matriculasPorGradoRaw = await Matricula.findAll({
    where: { estado: 'activa' },
    attributes: ['id_grado', [fn('COUNT', col('id_matricula')), 'total']],
    include: [{ association: 'grado', attributes: ['nombre'] }],
    group: ['id_grado', 'grado.id_grado'],
    raw: false,
  });

  const matriculasPorGrado = matriculasPorGradoRaw.map((r) => ({
    grado: r.grado?.nombre || 'Sin grado',
    total: parseInt(r.getDataValue('total'), 10) || 0,
  }));

  const contenidosPorMateriaRaw = await ContenidoClase.findAll({
    where: { fecha: rango.whereFecha },
    attributes: ['id_materia', [fn('COUNT', col('id_contenido')), 'total']],
    include: [{ association: 'materia', attributes: ['nombre'] }],
    group: ['id_materia', 'materia.id_materia'],
    raw: false,
  });

  const contenidosPorMateria = contenidosPorMateriaRaw.map((r) => ({
    materia: r.materia?.nombre || 'General',
    total: parseInt(r.getDataValue('total'), 10) || 0,
  }));

  const ausenciasTopRaw = await Asistencia.findAll({
    where: { fecha: rango.whereFecha, estado: 'ausente' },
    attributes: ['id_estudiante', [fn('COUNT', col('id_asistencia')), 'ausencias']],
    include: [{ association: 'estudiante', attributes: ['nombre_completo'] }],
    group: ['id_estudiante', 'estudiante.id_estudiante'],
    raw: false,
  });

  const estudiantesAusenciasTop = ausenciasTopRaw
    .map((r) => ({
      estudiante: r.estudiante?.nombre_completo || '—',
      ausencias: parseInt(r.getDataValue('ausencias'), 10) || 0,
    }))
    .sort((a, b) => b.ausencias - a.ausencias)
    .slice(0, 10);

  const totalMaestros = await Usuario.count({ where: { rol: 'maestro', activo: true } });
  const totalPadres = await Usuario.count({ where: { rol: 'padre', activo: true } });
  const totalEstudiantes = await Estudiante.count({ where: { activo: true } });
  const totalClases = await ContenidoClase.count({ where: { fecha: rango.whereFecha } });

  return {
    rango,
    resumen: {
      presentes,
      ausentes,
      totalRegistrosAsistencia: total,
      tasaAsistencia: total > 0 ? Math.round((presentes / total) * 100) : null,
      totalMaestros,
      totalPadres,
      totalEstudiantes,
      totalClases,
      justificantesPendientes,
    },
    asistenciaSerie,
    justificantes: {
      pendientes: justificantesPendientes,
      aprobados: justificantesAprobados,
      rechazados: justificantesRechazados,
    },
    matriculasPorGrado,
    contenidosPorMateria,
    estudiantesAusenciasTop,
  };
}

async function obtenerModuloReportesMaestro(idMaestro, { desde, hasta } = {}) {
  const rango = resolverRango({ desde, hasta, diasDefault: 30 });

  const asignacion = await AsignacionGrado.findOne({
    where: { id_maestro: idMaestro, activo: true },
    include: [{ association: 'grado', attributes: ['id_grado', 'nombre'] }],
  });

  if (!asignacion) {
    return {
      rango,
      grado: null,
      resumen: {
        presentes: 0,
        ausentes: 0,
        totalRegistrosAsistencia: 0,
        tasaAsistencia: null,
        totalEstudiantesActivos: 0,
        totalClases: 0,
        justificantesPendientes: 0,
      },
      asistenciaSerie: [],
      justificantes: { pendientes: 0, aprobados: 0, rechazados: 0 },
      contenidosPorMateria: [],
      estudiantesAusenciasTop: [],
      mensaje: 'No tienes grado asignado',
    };
  }

  const idGrado = asignacion.id_grado;
  const whereAsistencia = { fecha: rango.whereFecha, id_grado: idGrado };

  const presentes = await Asistencia.count({ where: { ...whereAsistencia, estado: 'presente' } });
  const ausentes = await Asistencia.count({ where: { ...whereAsistencia, estado: 'ausente' } });
  const total = presentes + ausentes;

  const asistenciaSerieRaw = await Asistencia.findAll({
    where: whereAsistencia,
    attributes: [
      'fecha',
      [fn('SUM', literal("CASE WHEN estado = 'presente' THEN 1 ELSE 0 END")), 'presentes'],
      [fn('SUM', literal("CASE WHEN estado = 'ausente' THEN 1 ELSE 0 END")), 'ausentes'],
    ],
    group: ['fecha'],
    order: [['fecha', 'ASC']],
    raw: true,
  });

  const mapaSerie = Object.fromEntries(asistenciaSerieRaw.map((f) => [
    ymd(f.fecha),
    {
      presentes: parseInt(f.presentes, 10) || 0,
      ausentes: parseInt(f.ausentes, 10) || 0,
    },
  ]));

  const asistenciaSerie = rangoFechas(rango.desde, rango.hasta).map((fecha) => ({
    fecha,
    presentes: mapaSerie[fecha]?.presentes || 0,
    ausentes: mapaSerie[fecha]?.ausentes || 0,
  }));

  const justificantesPendientes = await Justificante.count({
    where: { estado: 'pendiente' },
    include: [{ association: 'asistencia', where: { id_grado: idGrado }, attributes: [] }],
  });
  const justificantesAprobados = await Justificante.count({
    where: { estado: 'aprobado' },
    include: [{ association: 'asistencia', where: { id_grado: idGrado }, attributes: [] }],
  });
  const justificantesRechazados = await Justificante.count({
    where: { estado: 'rechazado' },
    include: [{ association: 'asistencia', where: { id_grado: idGrado }, attributes: [] }],
  });

  const contenidosPorMateriaRaw = await ContenidoClase.findAll({
    where: { fecha: rango.whereFecha, id_grado: idGrado },
    attributes: ['id_materia', [fn('COUNT', col('id_contenido')), 'total']],
    include: [{ association: 'materia', attributes: ['nombre'] }],
    group: ['id_materia', 'materia.id_materia'],
    raw: false,
  });

  const contenidosPorMateria = contenidosPorMateriaRaw.map((r) => ({
    materia: r.materia?.nombre || 'General',
    total: parseInt(r.getDataValue('total'), 10) || 0,
  }));

  const ausenciasTopRaw = await Asistencia.findAll({
    where: { ...whereAsistencia, estado: 'ausente' },
    attributes: ['id_estudiante', [fn('COUNT', col('id_asistencia')), 'ausencias']],
    include: [{ association: 'estudiante', attributes: ['nombre_completo'] }],
    group: ['id_estudiante', 'estudiante.id_estudiante'],
    raw: false,
  });

  const estudiantesAusenciasTop = ausenciasTopRaw
    .map((r) => ({
      estudiante: r.estudiante?.nombre_completo || '—',
      ausencias: parseInt(r.getDataValue('ausencias'), 10) || 0,
    }))
    .sort((a, b) => b.ausencias - a.ausencias)
    .slice(0, 10);

  const totalEstudiantesActivos = await Matricula.count({
    where: {
      id_grado: idGrado,
      estado: 'activa',
      anio_escolar: asignacion.anio_escolar,
    },
  });

  const totalClases = await ContenidoClase.count({ where: { fecha: rango.whereFecha, id_grado: idGrado } });

  return {
    rango,
    grado: {
      id_grado: idGrado,
      nombre: asignacion.grado?.nombre || 'Sin grado',
      anioEscolar: asignacion.anio_escolar,
    },
    resumen: {
      presentes,
      ausentes,
      totalRegistrosAsistencia: total,
      tasaAsistencia: total > 0 ? Math.round((presentes / total) * 100) : null,
      totalEstudiantesActivos,
      totalClases,
      justificantesPendientes,
    },
    asistenciaSerie,
    justificantes: {
      pendientes: justificantesPendientes,
      aprobados: justificantesAprobados,
      rechazados: justificantesRechazados,
    },
    contenidosPorMateria,
    estudiantesAusenciasTop,
  };
}

module.exports = {
  obtenerEstadisticasAdmin,
  obtenerResumenDiario,
  obtenerResumenDiarioMaestro,
  obtenerModuloReportesAdmin,
  obtenerModuloReportesMaestro,
};
