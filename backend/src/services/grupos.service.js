const { GrupoClase, Estudiante, Usuario } = require('../database');

async function listarGruposPorMaestro(id_usuario) {
  const grupos = await GrupoClase.findAll({
    where: { id_maestro: id_usuario, activo: true },
    attributes: ['id_grupo', 'nombre', 'materia', 'nivel_grado', 'anio_escolar', 'activo', 'creado_en'],
    order: [['nombre', 'ASC']],
  });
  return grupos;
}

async function listarEstudiantesDeGrupo(id_usuario, id_grupo) {
  const grupo = await GrupoClase.findOne({
    where: { id_grupo, id_maestro: id_usuario },
  });

  if (!grupo) return { error: 'Grupo no encontrado o no te pertenece' };

  const estudiantes = await grupo.getEstudiantes({
    attributes: ['id_estudiante', 'nombre_completo', 'codigo_matricula', 'fecha_nacimiento', 'sexo', 'nivel_grado', 'activo'],
    joinTableAttributes: ['inscrito_en', 'retirado_en'],
    order: [['nombre_completo', 'ASC']],
  });

  return { grupo: { id_grupo: grupo.id_grupo, nombre: grupo.nombre, materia: grupo.materia }, estudiantes };
}

module.exports = { listarGruposPorMaestro, listarEstudiantesDeGrupo };
