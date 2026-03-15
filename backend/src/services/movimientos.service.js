const { Movimiento } = require('../database');

async function registrarMovimiento({ id_usuario, rol, accion, detalle }) {
  if (!id_usuario || !rol || !accion) return;
  try {
    await Movimiento.create({ id_usuario, rol, accion, detalle: detalle || null });
  } catch (_) {
    // No bloquear flujo principal por errores de auditoría
  }
}

async function listarMovimientosUsuario({ id_usuario, rol, limite = 30 }) {
  return Movimiento.findAll({
    where: { id_usuario, rol },
    order: [['createdAt', 'DESC']],
    limit: limite,
  });
}

module.exports = { registrarMovimiento, listarMovimientosUsuario };
