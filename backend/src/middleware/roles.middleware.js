/**
 * Middleware de control de acceso por rol y tipo de actor.
 * Uso: permitir('maestro') o permitir('padre') o permitir('admin','maestro')
 */
function permitir(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ ok: false, mensaje: 'No autenticado', data: null });
    }

    const { rol, tipoActor } = req.usuario;
    const identificador = tipoActor === 'padre' ? 'padre' : rol;

    if (!rolesPermitidos.includes(identificador)) {
      return res.status(403).json({
        ok: false,
        mensaje: 'No tienes permisos para acceder a este recurso',
        data: null,
      });
    }

    return next();
  };
}

module.exports = { permitir };
