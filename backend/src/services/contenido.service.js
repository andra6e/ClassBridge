const { ContenidoClase, SesionClase, GrupoClase } = require('../database');

/**
 * Crea o actualiza contenido de una sesion (upsert por id_sesion).
 * Valida que la sesion pertenezca a un grupo del maestro.
 */
async function upsertContenido({ id_usuario, id_sesion, titulo, resumen, notas_extra }) {
  const sesion = await SesionClase.findByPk(id_sesion, {
    include: [{ association: 'grupo', attributes: ['id_grupo', 'id_maestro'] }],
  });

  if (!sesion) return { error: 'Sesion no encontrada' };
  if (sesion.grupo.id_maestro !== id_usuario) return { error: 'No tienes acceso a esta sesion' };

  let contenido = await ContenidoClase.findOne({ where: { id_sesion } });

  if (contenido) {
    await contenido.update({ titulo, resumen, notas_extra: notas_extra || null, subido_por: id_usuario });
  } else {
    contenido = await ContenidoClase.create({
      id_sesion,
      titulo,
      resumen,
      notas_extra: notas_extra || null,
      subido_por: id_usuario,
    });
  }

  return { contenido, actualizado: !!contenido.changed() === false };
}

module.exports = { upsertContenido };
