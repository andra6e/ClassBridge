const svc = require('../services/admin.service');
const { exito, error, creado } = require('../utils/response');

// ── MAESTROS ──

async function listarMaestros(req, res, next) {
  try {
    const lista = await svc.listarMaestros(req.usuario.id_escuela);
    return exito(res, lista, 'Maestros');
  } catch (err) { next(err); }
}

async function crearMaestro(req, res, next) {
  try {
    const resultado = await svc.crearMaestro(req.usuario.id_escuela, req.body);
    if (resultado.error) return error(res, resultado.error, 409);
    return creado(res, resultado.maestro, 'Maestro creado');
  } catch (err) { next(err); }
}

async function cambiarEstadoMaestro(req, res, next) {
  try {
    const id = parseInt(req.params.id_usuario, 10);
    if (isNaN(id)) return error(res, 'id_usuario invalido', 400);
    const resultado = await svc.cambiarEstadoMaestro(req.usuario.id_escuela, id, req.body.activo);
    if (resultado.error) return error(res, resultado.error, 404);
    return exito(res, resultado.maestro, 'Estado actualizado');
  } catch (err) { next(err); }
}

// ── GRUPOS ──

async function listarGrupos(req, res, next) {
  try {
    const lista = await svc.listarGrupos(req.usuario.id_escuela);
    return exito(res, lista, 'Grupos');
  } catch (err) { next(err); }
}

async function crearGrupo(req, res, next) {
  try {
    const resultado = await svc.crearGrupo(req.usuario.id_escuela, req.body);
    if (resultado.error) return error(res, resultado.error, 400);
    return creado(res, resultado.grupo, 'Grupo creado');
  } catch (err) { next(err); }
}

async function asignarMaestro(req, res, next) {
  try {
    const id = parseInt(req.params.id_grupo, 10);
    if (isNaN(id)) return error(res, 'id_grupo invalido', 400);
    const resultado = await svc.asignarMaestro(req.usuario.id_escuela, id, req.body.id_maestro);
    if (resultado.error) return error(res, resultado.error, 400);
    return exito(res, resultado.grupo, 'Maestro asignado');
  } catch (err) { next(err); }
}

// ── ESTUDIANTES ──

async function listarEstudiantes(req, res, next) {
  try {
    const lista = await svc.listarEstudiantes(req.usuario.id_escuela, req.query.busqueda);
    return exito(res, lista, 'Estudiantes');
  } catch (err) { next(err); }
}

async function crearEstudiante(req, res, next) {
  try {
    const resultado = await svc.crearEstudiante(req.usuario.id_escuela, req.body);
    if (resultado.error) return error(res, resultado.error, 409);
    return creado(res, resultado.estudiante, 'Estudiante creado');
  } catch (err) { next(err); }
}

async function cambiarEstadoEstudiante(req, res, next) {
  try {
    const id = parseInt(req.params.id_estudiante, 10);
    if (isNaN(id)) return error(res, 'id_estudiante invalido', 400);
    const resultado = await svc.cambiarEstadoEstudiante(req.usuario.id_escuela, id, req.body.activo);
    if (resultado.error) return error(res, resultado.error, 404);
    return exito(res, resultado.estudiante, 'Estado actualizado');
  } catch (err) { next(err); }
}

// ── MATRICULAS ──

async function listarInscritos(req, res, next) {
  try {
    const id = parseInt(req.params.id_grupo, 10);
    if (isNaN(id)) return error(res, 'id_grupo invalido', 400);
    const resultado = await svc.listarInscritos(req.usuario.id_escuela, id);
    if (resultado.error) return error(res, resultado.error, 404);
    return exito(res, resultado.inscritos, 'Inscritos');
  } catch (err) { next(err); }
}

async function matricularEstudiante(req, res, next) {
  try {
    const resultado = await svc.matricularEstudiante(
      req.usuario.id_escuela, req.body.id_grupo, req.body.id_estudiante
    );
    if (resultado.error) return error(res, resultado.error, 409);
    return creado(res, resultado.inscripcion, 'Estudiante matriculado');
  } catch (err) { next(err); }
}

async function retirarEstudiante(req, res, next) {
  try {
    const resultado = await svc.retirarEstudiante(
      req.usuario.id_escuela, req.body.id_grupo, req.body.id_estudiante
    );
    if (resultado.error) return error(res, resultado.error, 400);
    return exito(res, resultado.inscripcion, 'Estudiante retirado');
  } catch (err) { next(err); }
}

// ── PADRES ──

async function crearPadre(req, res, next) {
  try {
    const resultado = await svc.crearPadre(req.usuario.id_escuela, req.body);
    if (resultado.error) return error(res, resultado.error, 409);
    return creado(res, resultado.padre, 'Padre creado');
  } catch (err) { next(err); }
}

async function vincularPadreEstudiante(req, res, next) {
  try {
    const resultado = await svc.vincularPadreEstudiante(req.usuario.id_escuela, req.body);
    if (resultado.error) return error(res, resultado.error, 409);
    return creado(res, resultado.vinculo, 'Vinculo creado');
  } catch (err) { next(err); }
}

module.exports = {
  listarMaestros, crearMaestro, cambiarEstadoMaestro,
  listarGrupos, crearGrupo, asignarMaestro,
  listarEstudiantes, crearEstudiante, cambiarEstadoEstudiante,
  listarInscritos, matricularEstudiante, retirarEstudiante,
  crearPadre, vincularPadreEstudiante,
};
