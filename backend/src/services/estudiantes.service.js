const { Asistencia, PadreEstudiante, SesionClase, GrupoClase, JustificanteAusencia } = require('../database');

/**
 * Obtiene el historial de asistencia de un estudiante vinculado al padre.
 * Incluye sesion, grupo y justificante si existe.
 */
async function obtenerHistorialAsistenciaPadre(id_padre, id_estudiante, limite = 50) {
  const vinculo = await PadreEstudiante.findOne({
    where: { id_padre, id_estudiante },
  });
  if (!vinculo) return { error: 'Estudiante no vinculado a tu cuenta' };

  const asistencias = await Asistencia.findAll({
    where: { id_estudiante },
    include: [
      {
        association: 'sesion',
        attributes: ['id_sesion', 'fecha_sesion', 'id_grupo'],
        include: [{
          association: 'grupo',
          attributes: ['id_grupo', 'nombre', 'materia'],
        }],
      },
      {
        association: 'justificante',
        attributes: ['id_justificante', 'motivo', 'estado', 'enviado_en', 'revisado_en', 'notas_revision'],
        required: false,
      },
    ],
    attributes: ['id_asistencia', 'estado', 'notas', 'registrado_en'],
    order: [[{ model: SesionClase, as: 'sesion' }, 'fecha_sesion', 'DESC']],
    limit: limite,
  });

  return { asistencias };
}

module.exports = { obtenerHistorialAsistenciaPadre };
