const reportesService = require('../services/reportes.service');
const { exito, error } = require('../utils/response');

async function asistenciaMensual(req, res, next) {
  try {
    const id_grupo = parseInt(req.params.id_grupo, 10);
    if (isNaN(id_grupo)) return error(res, 'id_grupo invalido', 400);

    const mes = parseInt(req.query.mes, 10);
    const anio = parseInt(req.query.anio, 10);

    if (!mes || mes < 1 || mes > 12) return error(res, 'Parametro mes invalido (1-12)', 400);
    if (!anio || anio < 2000 || anio > 2100) return error(res, 'Parametro anio invalido', 400);

    const resultado = await reportesService.asistenciaMensual({
      id_grupo,
      mes,
      anio,
      usuario: req.usuario,
    });

    if (resultado.error) return error(res, resultado.error, 403);
    return exito(res, resultado, 'Reporte de asistencia mensual');
  } catch (err) { next(err); }
}

async function inasistenciasCriticas(req, res, next) {
  try {
    const id_grupo = parseInt(req.params.id_grupo, 10);
    if (isNaN(id_grupo)) return error(res, 'id_grupo invalido', 400);

    const umbral = parseFloat(req.query.umbral) || 20;

    const resultado = await reportesService.inasistenciasCriticas({
      id_grupo,
      umbral,
      usuario: req.usuario,
    });

    if (resultado.error) return error(res, resultado.error, 403);
    return exito(res, resultado, 'Inasistencias criticas');
  } catch (err) { next(err); }
}

async function resumenEscuela(req, res, next) {
  try {
    const resultado = await reportesService.resumenEscuela({
      id_escuela: req.usuario.id_escuela,
    });

    return exito(res, resultado, 'Resumen de escuela');
  } catch (err) { next(err); }
}

module.exports = { asistenciaMensual, inasistenciasCriticas, resumenEscuela };
