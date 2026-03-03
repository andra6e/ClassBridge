const contenidoService = require('../services/contenido.service');
const adjuntosService = require('../services/adjuntos.service');
const { exito, error, creado } = require('../utils/response');

async function upsertContenido(req, res, next) {
  try {
    const { id_sesion, titulo, resumen, notas_extra } = req.body;
    const resultado = await contenidoService.upsertContenido({
      id_usuario: req.usuario.id,
      id_sesion,
      titulo,
      resumen,
      notas_extra,
    });

    if (resultado.error) return error(res, resultado.error, 403);
    return exito(res, resultado.contenido, 'Contenido guardado');
  } catch (err) { next(err); }
}

async function crearAdjunto(req, res, next) {
  try {
    const { id_contenido, nombre_archivo, tipo_archivo, url_archivo, tamano_kb } = req.body;
    const resultado = await adjuntosService.crearAdjunto({
      id_usuario: req.usuario.id,
      id_contenido,
      nombre_archivo,
      tipo_archivo,
      url_archivo,
      tamano_kb,
    });

    if (resultado.error) return error(res, resultado.error, 403);
    return creado(res, resultado.adjunto, 'Adjunto creado');
  } catch (err) { next(err); }
}

module.exports = { upsertContenido, crearAdjunto };
