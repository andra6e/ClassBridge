const {
  sequelize,
  JustificanteAusencia,
  Asistencia,
  PadreEstudiante,
  SesionClase,
  GrupoClase,
  Estudiante,
  Padre,
} = require('../database');

/**
 * Padre crea un justificante para una asistencia de un hijo vinculado.
 */
async function crearJustificantePadre({ id_padre, id_asistencia, motivo, url_adjunto, nombre_adjunto }) {
  const asistencia = await Asistencia.findByPk(id_asistencia, {
    attributes: ['id_asistencia', 'id_estudiante', 'estado'],
  });
  if (!asistencia) return { error: 'Registro de asistencia no encontrado' };

  const vinculo = await PadreEstudiante.findOne({
    where: { id_padre, id_estudiante: asistencia.id_estudiante },
  });
  if (!vinculo) return { error: 'No tienes vinculo con este estudiante' };

  const existente = await JustificanteAusencia.findOne({ where: { id_asistencia } });
  if (existente) return { error: 'Ya existe un justificante para esta asistencia' };

  const justificante = await JustificanteAusencia.create({
    id_asistencia,
    id_padre,
    motivo,
    url_adjunto: url_adjunto || null,
    nombre_adjunto: nombre_adjunto || null,
  });

  return { justificante };
}

/**
 * Maestro lista justificantes pendientes de estudiantes en sus grupos.
 */
async function listarPendientesMaestro(id_usuario) {
  const justificantes = await JustificanteAusencia.findAll({
    where: { estado: 'pendiente' },
    include: [
      {
        association: 'asistencia',
        attributes: ['id_asistencia', 'id_estudiante', 'estado', 'registrado_en'],
        required: true,
        include: [
          {
            association: 'estudiante',
            attributes: ['id_estudiante', 'nombre_completo', 'codigo_matricula'],
          },
          {
            association: 'sesion',
            attributes: ['id_sesion', 'fecha_sesion', 'id_grupo'],
            required: true,
            include: [{
              association: 'grupo',
              attributes: ['id_grupo', 'nombre', 'materia', 'id_maestro'],
              where: { id_maestro: id_usuario },
              required: true,
            }],
          },
        ],
      },
      {
        association: 'padre',
        attributes: ['id_padre', 'nombre_completo'],
      },
    ],
    order: [['enviado_en', 'ASC']],
  });

  return justificantes;
}

/**
 * Maestro aprueba o rechaza un justificante.
 * Si aprueba, actualiza asistencia.estado = 'justificado'.
 */
async function revisarJustificanteMaestro({ id_usuario, id_justificante, estado, notas_revision }) {
  const justificante = await JustificanteAusencia.findByPk(id_justificante, {
    include: [{
      association: 'asistencia',
      include: [{
        association: 'sesion',
        include: [{
          association: 'grupo',
          attributes: ['id_maestro'],
        }],
      }],
    }],
  });

  if (!justificante) return { error: 'Justificante no encontrado' };
  if (justificante.asistencia.sesion.grupo.id_maestro !== id_usuario) {
    return { error: 'No tienes permiso para revisar este justificante' };
  }
  if (justificante.estado !== 'pendiente') {
    return { error: 'Este justificante ya fue revisado' };
  }

  const resultado = await sequelize.transaction(async (t) => {
    await justificante.update({
      estado,
      revisado_por: id_usuario,
      revisado_en: new Date(),
      notas_revision: notas_revision || null,
    }, { transaction: t });

    if (estado === 'aprobado') {
      await justificante.asistencia.update(
        { estado: 'justificado' },
        { transaction: t }
      );
    }

    return justificante;
  });

  return { justificante: resultado };
}

module.exports = { crearJustificantePadre, listarPendientesMaestro, revisarJustificanteMaestro };
