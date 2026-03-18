const reportesService = require('../services/reportes.service');
const { exito } = require('../utils/response');

async function estadisticasAdmin(req, res, next) {
  try {
    const resultado = await reportesService.obtenerEstadisticasAdmin();
    return exito(res, resultado, 'Estadisticas obtenidas');
  } catch (err) {
    next(err);
  }
}

async function resumenDiario(req, res, next) {
  try {
    const resultado = await reportesService.obtenerResumenDiario();
    return exito(res, resultado, 'Resumen diario obtenido');
  } catch (err) {
    next(err);
  }
}

async function resumenDiarioMaestro(req, res, next) {
  try {
    const resultado = await reportesService.obtenerResumenDiarioMaestro(req.usuario.id);
    return exito(res, resultado, 'Resumen diario del maestro obtenido');
  } catch (err) {
    next(err);
  }
}

module.exports = { estadisticasAdmin, resumenDiario, resumenDiarioMaestro };
