const { SesionClase, GrupoClase } = require('../database');

/**
 * Obtiene o crea una sesion para un grupo en una fecha dada.
 * Valida que el grupo pertenezca al maestro que la solicita.
 */
async function obtenerOCrearSesion({ id_grupo, fecha_sesion, creado_por }, opciones = {}) {
  const [sesion, creada] = await SesionClase.findOrCreate({
    where: { id_grupo, fecha_sesion },
    defaults: { creado_por },
    ...opciones,
  });

  return { sesion, creada };
}

/**
 * Valida que un grupo pertenezca al maestro indicado.
 */
async function validarGrupoMaestro(id_grupo, id_usuario) {
  const grupo = await GrupoClase.findOne({ where: { id_grupo, id_maestro: id_usuario } });
  return grupo;
}

module.exports = { obtenerOCrearSesion, validarGrupoMaestro };
