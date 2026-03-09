const logger = require('../utils/logger');
const {
  AsignacionGrado, Matricula, Asistencia, ContenidoClase,
} = require('../database');

async function obtenerMiGrado(idMaestro) {
  const asignacion = await AsignacionGrado.findOne({
    where: { id_maestro: idMaestro, activo: true },
    include: [{ association: 'grado' }],
  });
  if (!asignacion) return { error: 'No tienes grado asignado' };
  return asignacion;
}

async function listarEstudiantes(idGrado, anioEscolar) {
  const matriculas = await Matricula.findAll({
    where: { id_grado: idGrado, anio_escolar: anioEscolar, estado: 'activa' },
    include: [{ association: 'estudiante' }],
  });
  return matriculas;
}

async function guardarAsistencia({ id_grado, fecha, registros, registrado_por }) {
  const datos = registros.map((r) => ({
    id_estudiante: r.id_estudiante,
    estado: r.estado,
    id_grado,
    fecha,
    registrado_por,
  }));

  const resultado = await Asistencia.bulkCreate(datos, {
    updateOnDuplicate: ['estado', 'registrado_por', 'updatedAt'],
  });

  logger.info('Asistencia guardada', { id_grado, fecha, total: resultado.length });
  return resultado;
}

async function obtenerAsistencia(idGrado, fecha) {
  return Asistencia.findAll({
    where: { id_grado: idGrado, fecha },
    include: [
      { association: 'estudiante', attributes: ['id_estudiante', 'nombre_completo'] },
      { association: 'justificante' },
    ],
  });
}

async function guardarContenido(datos) {
  const [contenido, creado] = await ContenidoClase.findOrCreate({
    where: {
      id_grado: datos.id_grado,
      id_materia: datos.id_materia,
      fecha: datos.fecha,
    },
    defaults: datos,
  });

  if (!creado) {
    await contenido.update({
      tema: datos.tema,
      explicacion: datos.explicacion,
      actividades: datos.actividades,
      registrado_por: datos.registrado_por,
    });
  }

  return contenido;
}

async function listarContenido(idGrado, fecha) {
  const where = { id_grado: idGrado };
  if (fecha) where.fecha = fecha;

  return ContenidoClase.findAll({
    where,
    include: [{ association: 'materia' }],
    order: [['fecha', 'DESC']],
  });
}

module.exports = {
  obtenerMiGrado,
  listarEstudiantes,
  guardarAsistencia,
  obtenerAsistencia,
  guardarContenido,
  listarContenido,
};
