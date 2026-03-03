const justificantesService = require('../services/justificantes.service');
const { exito, error, creado } = require('../utils/response');

async function crearJustificante(req, res, next) {
  try {
    const { id_asistencia, motivo, url_adjunto, nombre_adjunto } = req.body;
    const resultado = await justificantesService.crearJustificantePadre({
      id_padre: req.usuario.id,
      id_asistencia,
      motivo,
      url_adjunto,
      nombre_adjunto,
    });

    if (resultado.error) return error(res, resultado.error, resultado.error.includes('vinculo') ? 403 : 409);
    return creado(res, resultado.justificante, 'Justificante enviado');
  } catch (err) { next(err); }
}

async function listarPendientes(req, res, next) {
  try {
    const justificantes = await justificantesService.listarPendientesMaestro(req.usuario.id);
    return exito(res, justificantes, 'Justificantes pendientes');
  } catch (err) { next(err); }
}

async function revisarJustificante(req, res, next) {
  try {
    const id_justificante = parseInt(req.params.id_justificante, 10);
    if (isNaN(id_justificante)) return error(res, 'id_justificante invalido', 400);

    const { estado, notas_revision } = req.body;
    const resultado = await justificantesService.revisarJustificanteMaestro({
      id_usuario: req.usuario.id,
      id_justificante,
      estado,
      notas_revision,
    });

    if (resultado.error) {
      const codigo = resultado.error.includes('permiso') ? 403 : 400;
      return error(res, resultado.error, codigo);
    }
    return exito(res, resultado.justificante, `Justificante ${estado}`);
  } catch (err) { next(err); }
}

module.exports = { crearJustificante, listarPendientes, revisarJustificante };
