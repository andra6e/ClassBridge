const sequelize = require('../config/db');

const Escuela = require('../models/escuela.model')(sequelize);
const Usuario = require('../models/usuario.model')(sequelize);
const Padre = require('../models/padre.model')(sequelize);
const Estudiante = require('../models/estudiante.model')(sequelize);
const PadreEstudiante = require('../models/padre-estudiante.model')(sequelize);
const GrupoClase = require('../models/grupo-clase.model')(sequelize);
const InscripcionGrupo = require('../models/inscripcion-grupo.model')(sequelize);
const SesionClase = require('../models/sesion-clase.model')(sequelize);
const Asistencia = require('../models/asistencia.model')(sequelize);
const ContenidoClase = require('../models/contenido-clase.model')(sequelize);
const AdjuntoContenido = require('../models/adjunto-contenido.model')(sequelize);
const JustificanteAusencia = require('../models/justificante-ausencia.model')(sequelize);

const modelos = {
  Escuela,
  Usuario,
  Padre,
  Estudiante,
  PadreEstudiante,
  GrupoClase,
  InscripcionGrupo,
  SesionClase,
  Asistencia,
  ContenidoClase,
  AdjuntoContenido,
  JustificanteAusencia,
};

Object.values(modelos).forEach((modelo) => {
  if (modelo.associate) {
    modelo.associate(modelos);
  }
});

module.exports = {
  sequelize,
  ...modelos,
};
