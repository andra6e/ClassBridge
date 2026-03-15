const movimientosService = require('../services/movimientos.service');
const { exito } = require('../utils/response');

async function misMovimientos(req, res, next) {
  try {
    const limite = Number(req.query.limite || 30);
    const resultado = await movimientosService.listarMovimientosUsuario({
      id_usuario: req.usuario.id,
      rol: req.usuario.rol,
      limite: Number.isNaN(limite) ? 30 : Math.min(Math.max(limite, 1), 100),
    });
    return exito(res, resultado, 'Movimientos obtenidos');
  } catch (err) {
    return next(err);
  }
}

module.exports = { misMovimientos };
