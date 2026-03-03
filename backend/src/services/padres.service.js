const { Padre, Estudiante } = require('../database');

async function listarEstudiantesDelPadre(id_padre) {
  const padre = await Padre.findByPk(id_padre, {
    include: [{
      association: 'hijos',
      attributes: ['id_estudiante', 'nombre_completo', 'codigo_matricula', 'fecha_nacimiento', 'sexo', 'nivel_grado', 'activo'],
      through: { attributes: ['relacion', 'es_principal'] },
    }],
  });

  if (!padre) return { error: 'Padre no encontrado' };
  return { estudiantes: padre.hijos };
}

module.exports = { listarEstudiantesDelPadre };
