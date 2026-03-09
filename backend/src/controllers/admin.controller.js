const adminService = require('../services/admin.service');
const { exito, error, creado } = require('../utils/response');

async function listarMaestros(req, res, next) {
  try {
    const resultado = await adminService.listarMaestros();
    return exito(res, resultado, 'Maestros listados');
  } catch (err) { next(err); }
}

async function crearMaestro(req, res, next) {
  try {
    const resultado = await adminService.crearMaestro(req.body);
    if (resultado.error) return error(res, resultado.error, 400);
    return creado(res, resultado, 'Maestro creado');
  } catch (err) { next(err); }
}

async function toggleMaestro(req, res, next) {
  try {
    const resultado = await adminService.toggleMaestro(req.params.id, req.body.activo);
    if (resultado.error) return error(res, resultado.error, 400);
    return exito(res, resultado, 'Estado del maestro actualizado');
  } catch (err) { next(err); }
}

async function listarPadres(req, res, next) {
  try {
    const resultado = await adminService.listarPadres();
    return exito(res, resultado, 'Padres listados');
  } catch (err) { next(err); }
}

async function obtenerPadre(req, res, next) {
  try {
    const resultado = await adminService.obtenerPadre(req.params.id);
    if (resultado.error) return error(res, resultado.error, 404);
    return exito(res, resultado, 'Padre obtenido');
  } catch (err) { next(err); }
}

async function crearPadre(req, res, next) {
  try {
    const resultado = await adminService.crearPadre(req.body);
    if (resultado.error) return error(res, resultado.error, 400);
    return creado(res, resultado, 'Padre creado');
  } catch (err) { next(err); }
}

async function listarEstudiantes(req, res, next) {
  try {
    const resultado = await adminService.listarEstudiantes();
    return exito(res, resultado, 'Estudiantes listados');
  } catch (err) { next(err); }
}

async function crearEstudiante(req, res, next) {
  try {
    const resultado = await adminService.crearEstudiante(req.body);
    if (resultado.error) return error(res, resultado.error, 400);
    return creado(res, resultado, 'Estudiante creado');
  } catch (err) { next(err); }
}

async function listarGrados(req, res, next) {
  try {
    const resultado = await adminService.listarGrados();
    return exito(res, resultado, 'Grados listados');
  } catch (err) { next(err); }
}

async function listarMatriculas(req, res, next) {
  try {
    const resultado = await adminService.listarMatriculas(req.query.anio_escolar);
    return exito(res, resultado, 'Matriculas listadas');
  } catch (err) { next(err); }
}

async function registrarFamilia(req, res, next) {
  try {
    const resultado = await adminService.registrarFamilia(req.body);
    if (resultado.error) return error(res, resultado.error, 400);
    return creado(res, resultado, 'Familia registrada correctamente');
  } catch (err) { next(err); }
}

async function crearMatricula(req, res, next) {
  try {
    const resultado = await adminService.crearMatricula(req.body);
    if (resultado.error) return error(res, resultado.error, 400);
    return creado(res, resultado, 'Matricula creada');
  } catch (err) { next(err); }
}

async function crearAsignacion(req, res, next) {
  try {
    const resultado = await adminService.crearAsignacion(req.body);
    if (resultado.error) return error(res, resultado.error, 400);
    return creado(res, resultado, 'Asignacion creada');
  } catch (err) { next(err); }
}

async function eliminarAsignacion(req, res, next) {
  try {
    const resultado = await adminService.eliminarAsignacion(req.params.id);
    if (resultado.error) return error(res, resultado.error, 400);
    return exito(res, resultado, 'Asignacion eliminada');
  } catch (err) { next(err); }
}

async function promocionIndividual(req, res, next) {
  try {
    const resultado = await adminService.promocionIndividual(req.params.id, req.body.id_grado);
    if (resultado.error) return error(res, resultado.error, 400);
    return exito(res, resultado, 'Promocion individual realizada');
  } catch (err) { next(err); }
}

async function promocionGrado(req, res, next) {
  try {
    const resultado = await adminService.promocionGrado(req.body.id_grado, req.body.anio_escolar);
    if (resultado.error) return error(res, resultado.error, 400);
    return exito(res, resultado, 'Promocion de grado realizada');
  } catch (err) { next(err); }
}

module.exports = {
  listarMaestros,
  crearMaestro,
  toggleMaestro,
  listarPadres,
  obtenerPadre,
  crearPadre,
  listarEstudiantes,
  crearEstudiante,
  listarGrados,
  listarMatriculas,
  registrarFamilia,
  crearMatricula,
  crearAsignacion,
  eliminarAsignacion,
  promocionIndividual,
  promocionGrado,
};
