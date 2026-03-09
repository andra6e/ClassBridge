const maestroService = require('../services/maestro.service');
const { exito, error } = require('../utils/response');

async function obtenerMiGrado(req, res, next) {
  try {
    const resultado = await maestroService.obtenerMiGrado(req.usuario.id);
    if (resultado.error) return error(res, resultado.error, 404);

    return exito(res, resultado, 'Grado asignado obtenido');
  } catch (err) { next(err); }
}

async function listarEstudiantes(req, res, next) {
  try {
    const { id_grado, anio_escolar } = req.query;
    const resultado = await maestroService.listarEstudiantes(id_grado, anio_escolar);
    return exito(res, resultado, 'Estudiantes listados');
  } catch (err) { next(err); }
}

async function guardarAsistencia(req, res, next) {
  try {
    const datos = { ...req.body, registrado_por: req.usuario.id };
    const resultado = await maestroService.guardarAsistencia(datos);
    return exito(res, resultado, 'Asistencia guardada');
  } catch (err) { next(err); }
}

async function obtenerAsistencia(req, res, next) {
  try {
    const { id_grado, fecha } = req.query;
    const resultado = await maestroService.obtenerAsistencia(id_grado, fecha);
    return exito(res, resultado, 'Asistencia obtenida');
  } catch (err) { next(err); }
}

async function guardarContenido(req, res, next) {
  try {
    const datos = { ...req.body, registrado_por: req.usuario.id };
    const resultado = await maestroService.guardarContenido(datos);
    return exito(res, resultado, 'Contenido guardado');
  } catch (err) { next(err); }
}

async function listarContenido(req, res, next) {
  try {
    const { id_grado, fecha } = req.query;
    const resultado = await maestroService.listarContenido(id_grado, fecha);
    return exito(res, resultado, 'Contenido listado');
  } catch (err) { next(err); }
}

module.exports = {
  obtenerMiGrado,
  listarEstudiantes,
  guardarAsistencia,
  obtenerAsistencia,
  guardarContenido,
  listarContenido,
};
