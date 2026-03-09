function permitir(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ ok: false, mensaje: 'No autenticado', data: null });
    }
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ ok: false, mensaje: 'No tienes permisos para acceder a este recurso', data: null });
    }
    return next();
  };
}

module.exports = { permitir };
