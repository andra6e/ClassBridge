const gruposService = require('../services/grupos.service');
const { exito, error } = require('../utils/response');

async function listarGrupos(req, res, next) {
  try {
    const grupos = await gruposService.listarGruposPorMaestro(req.usuario.id);
    return exito(res, grupos, 'Grupos del maestro');
  } catch (err) { next(err); }
}

async function listarEstudiantes(req, res, next) {
  try {
    const id_grupo = parseInt(req.params.id_grupo, 10);
    if (isNaN(id_grupo)) return error(res, 'id_grupo invalido', 400);

    const resultado = await gruposService.listarEstudiantesDeGrupo(req.usuario.id, id_grupo);
    if (resultado.error) return error(res, resultado.error, 403);
    return exito(res, resultado, 'Estudiantes del grupo');
  } catch (err) { next(err); }
}

module.exports = { listarGrupos, listarEstudiantes };
