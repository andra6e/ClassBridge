const justificantesService = require('../services/justificantes.service');
const { exito, error, creado } = require('../utils/response');

async function crearJustificante(req, res, next) {
  try {
    const resultado = await justificantesService.crearJustificante({
      ...req.body,
      enviado_por: req.usuario.id,
    });
    if (resultado.error) return error(res, resultado.error, 400);
    return creado(res, resultado, 'Justificante creado');
  } catch (err) { next(err); }
}

async function listarPendientes(req, res, next) {
  try {
    const resultado = await justificantesService.listarPendientes(req.usuario.id);
    if (resultado.error) return error(res, resultado.error, 404);
    return exito(res, resultado, 'Justificantes pendientes listados');
  } catch (err) { next(err); }
}

async function revisarJustificante(req, res, next) {
  try {
    const resultado = await justificantesService.revisarJustificante(
      req.params.id,
      req.usuario.id,
      req.body.estado,
    );
    if (resultado.error) return error(res, resultado.error, 400);
    return exito(res, resultado, 'Justificante revisado');
  } catch (err) { next(err); }
}

module.exports = { crearJustificante, listarPendientes, revisarJustificante };
