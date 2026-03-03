/**
 * Respuestas estandar JSON para la API.
 * Formato: { ok: boolean, mensaje: string, data: any }
 */

function exito(res, data = null, mensaje = 'Operacion exitosa', codigo = 200) {
  return res.status(codigo).json({ ok: true, mensaje, data });
}

function error(res, mensaje = 'Error interno', codigo = 500, data = null) {
  return res.status(codigo).json({ ok: false, mensaje, data });
}

function creado(res, data = null, mensaje = 'Recurso creado') {
  return exito(res, data, mensaje, 201);
}

module.exports = { exito, error, creado };
