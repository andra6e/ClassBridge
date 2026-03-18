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
    const idGrado = req.query?.id_grado ? Number(req.query.id_grado) : null;
    const resultado = await reportesService.obtenerResumenDiarioMaestro(req.usuario.id, idGrado);
    return exito(res, resultado, 'Resumen diario del maestro obtenido');
  } catch (err) {
    next(err);
  }
}

async function moduloAdmin(req, res, next) {
  try {
    const { desde, hasta } = req.query;
    const resultado = await reportesService.obtenerModuloReportesAdmin({ desde, hasta });
    return exito(res, resultado, 'Reporte avanzado de administración obtenido');
  } catch (err) {
    next(err);
  }
}

async function moduloMaestro(req, res, next) {
  try {
    const { desde, hasta } = req.query;
    const resultado = await reportesService.obtenerModuloReportesMaestro(req.usuario.id, { desde, hasta });
    return exito(res, resultado, 'Reporte avanzado del maestro obtenido');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  estadisticasAdmin,
  resumenDiario,
  resumenDiarioMaestro,
  moduloAdmin,
  moduloMaestro,
};
