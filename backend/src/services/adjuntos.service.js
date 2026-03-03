const { AdjuntoContenido, ContenidoClase, SesionClase } = require('../database');

/**
 * Crea un adjunto de tipo enlace para un contenido.
 * Valida que el contenido pertenezca a una sesion del maestro.
 */
async function crearAdjunto({ id_usuario, id_contenido, nombre_archivo, tipo_archivo, url_archivo, tamano_kb }) {
  const contenido = await ContenidoClase.findByPk(id_contenido, {
    include: [{
      association: 'sesion',
      include: [{ association: 'grupo', attributes: ['id_maestro'] }],
    }],
  });

  if (!contenido) return { error: 'Contenido no encontrado' };
  if (contenido.sesion.grupo.id_maestro !== id_usuario) return { error: 'No tienes acceso a este contenido' };

  const adjunto = await AdjuntoContenido.create({
    id_contenido,
    nombre_archivo,
    tipo_archivo,
    url_archivo,
    tamano_kb: tamano_kb || null,
    subido_por: id_usuario,
  });

  return { adjunto };
}

module.exports = { crearAdjunto };
