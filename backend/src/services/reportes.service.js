const { Op } = require('sequelize');
const {
  sequelize,
  GrupoClase,
  SesionClase,
  Asistencia,
  Estudiante,
  InscripcionGrupo,
  Usuario,
} = require('../database');

// ---------------------------------------------------------------------------
// Helpers de validación
// ---------------------------------------------------------------------------

/**
 * Valida que un grupo pertenezca al maestro o a la escuela del admin.
 * Retorna el grupo si es válido, o { error } si no.
 */
async function validarAccesoGrupo(id_grupo, usuario) {
  const grupo = await GrupoClase.findByPk(id_grupo, {
    attributes: ['id_grupo', 'nombre', 'materia', 'id_maestro', 'id_escuela'],
  });

  if (!grupo) return { error: 'Grupo no encontrado' };

  if (usuario.rol === 'maestro' && grupo.id_maestro !== usuario.id) {
    return { error: 'No tienes acceso a este grupo' };
  }

  if (usuario.rol === 'admin' && grupo.id_escuela !== usuario.id_escuela) {
    return { error: 'Este grupo no pertenece a tu escuela' };
  }

  return { grupo };
}

/**
 * Construye el rango de fechas para un mes y año dados.
 */
function rangoMes(mes, anio) {
  const inicio = new Date(anio, mes - 1, 1);
  const fin = new Date(anio, mes, 0); // último día del mes
  const fechaInicio = inicio.toISOString().split('T')[0];
  const fechaFin = fin.toISOString().split('T')[0];
  return { fechaInicio, fechaFin };
}

// ---------------------------------------------------------------------------
// 1. Asistencia mensual de un grupo
// ---------------------------------------------------------------------------

async function asistenciaMensual({ id_grupo, mes, anio, usuario }) {
  const acceso = await validarAccesoGrupo(id_grupo, usuario);
  if (acceso.error) return acceso;

  const { grupo } = acceso;
  const { fechaInicio, fechaFin } = rangoMes(mes, anio);

  // Sesiones del grupo en el mes
  const sesiones = await SesionClase.findAll({
    where: {
      id_grupo,
      fecha_sesion: { [Op.between]: [fechaInicio, fechaFin] },
    },
    attributes: ['id_sesion'],
  });

  const totalSesiones = sesiones.length;

  if (totalSesiones === 0) {
    return {
      grupo: { id_grupo: grupo.id_grupo, nombre: grupo.nombre, materia: grupo.materia },
      mes,
      anio,
      total_sesiones: 0,
      promedio_asistencia: 0,
      desglose: { presentes: 0, ausentes: 0, justificados: 0, tardes: 0 },
      estudiantes: [],
    };
  }

  const idsSesiones = sesiones.map((s) => s.id_sesion);

  // Desglose global de estados
  const desglose = await Asistencia.findAll({
    where: { id_sesion: { [Op.in]: idsSesiones } },
    attributes: [
      'estado',
      [sequelize.fn('COUNT', sequelize.col('id_asistencia')), 'total'],
    ],
    group: ['estado'],
    raw: true,
  });

  const resumen = { presentes: 0, ausentes: 0, justificados: 0, tardes: 0 };
  for (const fila of desglose) {
    const clave = fila.estado === 'tarde' ? 'tardes' : `${fila.estado}s`;
    resumen[clave] = parseInt(fila.total, 10);
  }

  // Alumnos inscritos × sesiones = denominador ideal para el promedio del grupo
  const totalAlumnos = await InscripcionGrupo.count({
    where: { id_grupo, retirado_en: null },
  });
  const denominadorGlobal = totalSesiones * totalAlumnos;

  const promedioAsistencia = denominadorGlobal > 0
    ? Math.round(((resumen.presentes + resumen.justificados + resumen.tardes) / denominadorGlobal) * 10000) / 100
    : 0;

  // Asistencia desglosada por estudiante
  const porEstudiante = await Asistencia.findAll({
    where: { id_sesion: { [Op.in]: idsSesiones } },
    attributes: [
      'id_estudiante',
      'estado',
      [sequelize.fn('COUNT', sequelize.col('id_asistencia')), 'total'],
    ],
    include: [{
      association: 'estudiante',
      attributes: ['nombre_completo', 'codigo_matricula'],
    }],
    group: ['id_estudiante', 'estado'],
    raw: true,
    nest: true,
  });

  // Agrupar por estudiante
  const mapaEstudiantes = {};
  for (const fila of porEstudiante) {
    const id = fila.id_estudiante;
    if (!mapaEstudiantes[id]) {
      mapaEstudiantes[id] = {
        id_estudiante: id,
        nombre_completo: fila.estudiante.nombre_completo,
        codigo_matricula: fila.estudiante.codigo_matricula,
        presentes: 0,
        ausentes: 0,
        justificados: 0,
        tardes: 0,
        total_registros: 0,
      };
    }
    const clave = fila.estado === 'tarde' ? 'tardes' : `${fila.estado}s`;
    const cantidad = parseInt(fila.total, 10);
    mapaEstudiantes[id][clave] = cantidad;
    mapaEstudiantes[id].total_registros += cantidad;
  }

  const estudiantes = Object.values(mapaEstudiantes).map((est) => ({
    ...est,
    total_sesiones: totalSesiones,
    porcentaje_asistencia: totalSesiones > 0
      ? Math.round(((est.presentes + est.justificados + est.tardes) / totalSesiones) * 10000) / 100
      : 0,
  }));

  return {
    grupo: { id_grupo: grupo.id_grupo, nombre: grupo.nombre, materia: grupo.materia },
    mes,
    anio,
    total_sesiones: totalSesiones,
    promedio_asistencia: promedioAsistencia,
    desglose: resumen,
    estudiantes,
  };
}

// ---------------------------------------------------------------------------
// 2. Inasistencias críticas de un grupo
// ---------------------------------------------------------------------------

async function inasistenciasCriticas({ id_grupo, umbral, usuario }) {
  const acceso = await validarAccesoGrupo(id_grupo, usuario);
  if (acceso.error) return acceso;

  const { grupo } = acceso;

  // Total de sesiones del grupo
  const totalSesiones = await SesionClase.count({ where: { id_grupo } });

  if (totalSesiones === 0) {
    return {
      grupo: { id_grupo: grupo.id_grupo, nombre: grupo.nombre, materia: grupo.materia },
      umbral,
      total_sesiones: 0,
      estudiantes_criticos: [],
    };
  }

  // Contar ausencias (sin justificar) por estudiante
  const ausencias = await Asistencia.findAll({
    where: { estado: 'ausente' },
    attributes: [
      'id_estudiante',
      [sequelize.fn('COUNT', sequelize.col('Asistencia.id_asistencia')), 'total_ausencias'],
    ],
    include: [
      {
        association: 'sesion',
        attributes: [],
        where: { id_grupo },
        required: true,
      },
      {
        association: 'estudiante',
        attributes: ['nombre_completo', 'codigo_matricula'],
      },
    ],
    group: ['id_estudiante'],
    raw: true,
    nest: true,
  });

  const estudiantesCriticos = ausencias
    .map((fila) => {
      const totalAus = parseInt(fila.total_ausencias, 10);
      const porcentaje = Math.round((totalAus / totalSesiones) * 10000) / 100;
      return {
        id_estudiante: fila.id_estudiante,
        nombre_completo: fila.estudiante.nombre_completo,
        codigo_matricula: fila.estudiante.codigo_matricula,
        total_clases: totalSesiones,
        total_ausencias: totalAus,
        porcentaje_inasistencia: porcentaje,
      };
    })
    .filter((e) => e.porcentaje_inasistencia >= umbral)
    .sort((a, b) => b.porcentaje_inasistencia - a.porcentaje_inasistencia);

  return {
    grupo: { id_grupo: grupo.id_grupo, nombre: grupo.nombre, materia: grupo.materia },
    umbral,
    total_sesiones: totalSesiones,
    estudiantes_criticos: estudiantesCriticos,
  };
}

// ---------------------------------------------------------------------------
// 3. Resumen general de la escuela (solo admin)
// ---------------------------------------------------------------------------

async function resumenEscuela({ id_escuela }) {
  const grupos = await GrupoClase.findAll({
    where: { id_escuela, activo: true },
    attributes: ['id_grupo', 'nombre', 'materia'],
    include: [{
      association: 'maestro',
      attributes: ['id_usuario', 'nombre_completo'],
    }],
    order: [['nombre', 'ASC']],
  });

  const resumen = [];

  for (const grupo of grupos) {
    const totalSesiones = await SesionClase.count({ where: { id_grupo: grupo.id_grupo } });

    const totalAlumnos = await InscripcionGrupo.count({
      where: { id_grupo: grupo.id_grupo, retirado_en: null },
    });

    let promedioAsistencia = 0;
    let cantidadCriticos = 0;

    if (totalSesiones > 0) {
      // Promedio de asistencia del grupo
      const idsSesiones = (await SesionClase.findAll({
        where: { id_grupo: grupo.id_grupo },
        attributes: ['id_sesion'],
        raw: true,
      })).map((s) => s.id_sesion);

      const totalRegistros = await Asistencia.count({
        where: { id_sesion: { [Op.in]: idsSesiones } },
      });

      const asistieron = await Asistencia.count({
        where: {
          id_sesion: { [Op.in]: idsSesiones },
          estado: { [Op.in]: ['presente', 'justificado', 'tarde'] },
        },
      });

      promedioAsistencia = totalRegistros > 0
        ? Math.round((asistieron / totalRegistros) * 10000) / 100
        : 0;

      // Estudiantes con >= 20% de inasistencias
      const ausencias = await Asistencia.findAll({
        where: { estado: 'ausente' },
        attributes: [
          'id_estudiante',
          [sequelize.fn('COUNT', sequelize.col('Asistencia.id_asistencia')), 'total_ausencias'],
        ],
        include: [{
          association: 'sesion',
          attributes: [],
          where: { id_grupo: grupo.id_grupo },
          required: true,
        }],
        group: ['id_estudiante'],
        raw: true,
      });

      cantidadCriticos = ausencias.filter((a) => {
        const pct = parseInt(a.total_ausencias, 10) / totalSesiones;
        return pct >= 0.2;
      }).length;
    }

    resumen.push({
      id_grupo: grupo.id_grupo,
      nombre: grupo.nombre,
      materia: grupo.materia,
      maestro: {
        id_usuario: grupo.maestro.id_usuario,
        nombre_completo: grupo.maestro.nombre_completo,
      },
      total_sesiones: totalSesiones,
      total_alumnos: totalAlumnos,
      promedio_asistencia: promedioAsistencia,
      alumnos_inasistencia_critica: cantidadCriticos,
    });
  }

  return { escuela_id: id_escuela, grupos: resumen };
}

module.exports = { asistenciaMensual, inasistenciasCriticas, resumenEscuela };
