const adminService = require('../services/admin.service');
const { exito, error, creado } = require('../utils/response');
const { registrarMovimiento } = require('../services/movimientos.service');

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
    await registrarMovimiento({
      id_usuario: req.usuario.id,
      rol: req.usuario.rol,
      accion: 'admin_crea_maestro',
      detalle: `Creó maestro ${resultado.nombre_completo}`,
    });
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
    const resultado = await adminService.listarPadres({
      q: req.query.q,
      estado: req.query.estado,
      estudiante: req.query.estudiante,
    });
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

async function actualizarPadre(req, res, next) {
  try {
    const resultado = await adminService.actualizarPadre(req.params.id, req.body);
    if (resultado.error) return error(res, resultado.error, 400);
    await registrarMovimiento({
      id_usuario: req.usuario.id,
      rol: req.usuario.rol,
      accion: 'admin_actualiza_padre',
      detalle: `Actualizó padre ${resultado.nombre_completo}`,
    });
    return exito(res, resultado, 'Padre actualizado');
  } catch (err) { next(err); }
}

async function eliminarPadre(req, res, next) {
  try {
    const resultado = await adminService.eliminarPadre(req.params.id);
    if (resultado.error) return error(res, resultado.error, 400);
    await registrarMovimiento({
      id_usuario: req.usuario.id,
      rol: req.usuario.rol,
      accion: 'admin_elimina_padre',
      detalle: `Eliminó padre ID ${req.params.id}`,
    });
    return exito(res, resultado, 'Padre eliminado');
  } catch (err) { next(err); }
}

async function listarEstudiantes(req, res, next) {
  try {
    const resultado = await adminService.listarEstudiantes({
      id_grado: req.query.id_grado,
      id_padre: req.query.id_padre,
      estado: req.query.estado,
    });
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

async function actualizarEstudiante(req, res, next) {
  try {
    const resultado = await adminService.actualizarEstudiante(req.params.id, req.body);
    if (resultado.error) return error(res, resultado.error, 400);
    await registrarMovimiento({
      id_usuario: req.usuario.id,
      rol: req.usuario.rol,
      accion: 'admin_actualiza_estudiante',
      detalle: `Actualizó estudiante ${resultado.nombre_completo}`,
    });
    return exito(res, resultado, 'Estudiante actualizado');
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
    const id_padre = req.query.id_padre ? Number(req.query.id_padre) : undefined;
    const resultado = await adminService.listarMatriculas(req.query.anio_escolar, id_padre);
    return exito(res, resultado, 'Matriculas listadas');
  } catch (err) { next(err); }
}

async function obtenerMatricula(req, res, next) {
  try {
    const resultado = await adminService.obtenerMatricula(req.params.id);
    if (resultado.error) return error(res, resultado.error, 404);
    return exito(res, resultado, 'Matricula obtenida');
  } catch (err) { next(err); }
}

async function actualizarMatricula(req, res, next) {
  try {
    const resultado = await adminService.actualizarMatricula(req.params.id, req.body);
    if (resultado.error) return error(res, resultado.error, 400);
    await registrarMovimiento({
      id_usuario: req.usuario.id,
      rol: req.usuario.rol,
      accion: 'admin_actualiza_matricula',
      detalle: `Actualizó matrícula ${req.params.id}`,
    });
    return exito(res, resultado, 'Matricula actualizada');
  } catch (err) { next(err); }
}

async function eliminarMatricula(req, res, next) {
  try {
    const resultado = await adminService.eliminarMatricula(req.params.id);
    if (resultado.error) return error(res, resultado.error, 400);
    await registrarMovimiento({
      id_usuario: req.usuario.id,
      rol: req.usuario.rol,
      accion: 'admin_elimina_matricula',
      detalle: `Eliminó matrícula ${req.params.id}`,
    });
    return exito(res, resultado, 'Matricula eliminada');
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
    await registrarMovimiento({
      id_usuario: req.usuario.id,
      rol: req.usuario.rol,
      accion: 'admin_asigna_maestro',
      detalle: `Asignó maestro ${req.body.id_maestro} al grado ${req.body.id_grado}`,
    });
    return creado(res, resultado, 'Asignacion guardada');
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
    const nuevoIdGrado = req.body.nuevo_id_grado ?? req.body.id_grado;
    const resultado = await adminService.promocionIndividual(
      req.body.id_matricula,
      nuevoIdGrado,
    );
    if (resultado.error) return error(res, resultado.error, 400);
    return exito(res, resultado, 'Promocion individual realizada');
  } catch (err) { next(err); }
}

async function promocionGrado(req, res, next) {
  try {
    const resultado = await adminService.promocionGrado(req.body.id_grado, req.body.anio_escolar);
    if (resultado.error) return error(res, resultado.error, 400);
    await registrarMovimiento({
      id_usuario: req.usuario.id,
      rol: req.usuario.rol,
      accion: 'admin_promocion_grado',
      detalle: `Promovió grado ${req.body.id_grado} (${req.body.anio_escolar})`,
    });
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
  actualizarPadre,
  eliminarPadre,
  listarEstudiantes,
  crearEstudiante,
  actualizarEstudiante,
  listarGrados,
  listarMatriculas,
  obtenerMatricula,
  actualizarMatricula,
  eliminarMatricula,
  registrarFamilia,
  crearMatricula,
  crearAsignacion,
  eliminarAsignacion,
  promocionIndividual,
  promocionGrado,
};
