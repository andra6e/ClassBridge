const { sequelize, Asistencia, SesionClase, GrupoClase } = require('../database');
const { obtenerOCrearSesion, validarGrupoMaestro } = require('./sesiones.service');

/**
 * Guarda asistencia masiva para un grupo en una fecha.
 * Usa transaccion y upsert por cada registro.
 */
async function guardarAsistenciaMasiva({ id_usuario, id_grupo, fecha_sesion, registros }) {
  const grupo = await validarGrupoMaestro(id_grupo, id_usuario);
  if (!grupo) return { error: 'Grupo no encontrado o no te pertenece' };

  const resultado = await sequelize.transaction(async (t) => {
    const { sesion } = await obtenerOCrearSesion(
      { id_grupo, fecha_sesion, creado_por: id_usuario },
      { transaction: t }
    );

    const resumen = { presentes: 0, ausentes: 0, tardes: 0, justificados: 0 };

    for (const reg of registros) {
      const [registro, creado] = await Asistencia.findOrCreate({
        where: { id_sesion: sesion.id_sesion, id_estudiante: reg.id_estudiante },
        defaults: {
          estado: reg.estado,
          notas: reg.notas || null,
          registrado_por: id_usuario,
        },
        transaction: t,
      });

      if (!creado) {
        await registro.update({
          estado: reg.estado,
          notas: reg.notas || null,
          registrado_por: id_usuario,
        }, { transaction: t });
      }

      resumen[`${reg.estado}s`] = (resumen[`${reg.estado}s`] || 0) + 1;
    }

    return {
      id_sesion: sesion.id_sesion,
      fecha_sesion: sesion.fecha_sesion,
      total: registros.length,
      resumen,
    };
  });

  return resultado;
}

module.exports = { guardarAsistenciaMasiva };
