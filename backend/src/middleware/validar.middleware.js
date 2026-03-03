/**
 * Middleware generico para validar req.body con un esquema Zod.
 * Uso: validar(esquemaLogin) como middleware de ruta.
 */
function validar(esquemaZod) {
  return (req, _res, next) => {
    const resultado = esquemaZod.safeParse(req.body);
    if (!resultado.success) {
      const err = resultado.error;
      err.name = 'ZodError';
      return next(err);
    }
    req.body = resultado.data;
    return next();
  };
}

module.exports = { validar };
