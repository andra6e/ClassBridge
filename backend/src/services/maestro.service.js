const logger = require('../utils/logger');
const { Op } = require('sequelize');
const {
  AsignacionGrado, Matricula, Asistencia, ContenidoClase,
} = require('../database');
const { guardarArchivoBase64 } = require('../utils/file-storage');
const { registrarMovimiento } = require('./movimientos.service');

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
  await registrarMovimiento({
    id_usuario: registrado_por,
    rol: 'maestro',
    accion: 'asistencia_guardada',
    detalle: `Asistencia guardada para grado ${id_grado} en ${fecha}`,
  });
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
  const tipoContenido = datos.tipo_contenido || 'materia';
  const archivoGuardado = guardarArchivoBase64({
    carpetaRelativa: 'contenido',
    archivo: datos.archivo,
  });

  const where = {
    id_grado: datos.id_grado,
    fecha: datos.fecha,
    tipo_contenido: tipoContenido,
  };
  if (tipoContenido === 'materia') where.id_materia = datos.id_materia;
  else where.id_materia = { [Op.is]: null };

  const defaultsContenido = {
    id_grado: datos.id_grado,
    fecha: datos.fecha,
    tipo_contenido: tipoContenido,
    id_materia: tipoContenido === 'materia' ? datos.id_materia : null,
    tema: datos.tema,
    explicacion: datos.explicacion,
    actividades: datos.actividades ?? null,
    archivo_nombre: archivoGuardado?.nombre || null,
    archivo_url: archivoGuardado?.url || null,
    archivo_mime: archivoGuardado?.mime || null,
    registrado_por: datos.registrado_por,
  };

  const [contenido, creado] = await ContenidoClase.findOrCreate({
    where,
    defaults: defaultsContenido,
  });

  if (!creado) {
    await contenido.update({
      tipo_contenido: tipoContenido,
      id_materia: tipoContenido === 'materia' ? datos.id_materia : null,
      tema: datos.tema,
      explicacion: datos.explicacion,
      actividades: datos.actividades,
      archivo_nombre: archivoGuardado?.nombre || contenido.archivo_nombre,
      archivo_url: archivoGuardado?.url || contenido.archivo_url,
      archivo_mime: archivoGuardado?.mime || contenido.archivo_mime,
      registrado_por: datos.registrado_por,
    });
  }

  await registrarMovimiento({
    id_usuario: datos.registrado_por,
    rol: 'maestro',
    accion: tipoContenido === 'general' ? 'contenido_general_guardado' : 'contenido_materia_guardado',
    detalle: `Contenido ${tipoContenido} guardado para grado ${datos.id_grado} en ${datos.fecha}`,
  });

  return contenido;
}

async function listarContenido(idGrado, fecha) {
  const where = { id_grado: idGrado };
  if (fecha) where.fecha = fecha;

  return ContenidoClase.findAll({
    where,
    include: [{ association: 'materia' }],
    order: [['fecha', 'DESC'], ['tipo_contenido', 'ASC']],
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
