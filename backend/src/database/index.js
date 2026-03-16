const sequelize = require('../config/db');

const Usuario = require('../models/usuario.model')(sequelize);
const Grado = require('../models/grado.model')(sequelize);
const Materia = require('../models/materia.model')(sequelize);
const Estudiante = require('../models/estudiante.model')(sequelize);
const Matricula = require('../models/matricula.model')(sequelize);
const AsignacionGrado = require('../models/asignacion-grado.model')(sequelize);
const Asistencia = require('../models/asistencia.model')(sequelize);
const ContenidoClase = require('../models/contenido-clase.model')(sequelize);
const Justificante = require('../models/justificante.model')(sequelize);
const ConversacionIA = require('../models/conversacion-ia.model')(sequelize);
const MensajeIA = require('../models/mensaje-ia.model')(sequelize);
const Movimiento = require('../models/movimiento.model')(sequelize);
const DispositivoPush = require('../models/dispositivo-push.model')(sequelize);

const modelos = {
  Usuario,
  Grado,
  Materia,
  Estudiante,
  Matricula,
  AsignacionGrado,
  Asistencia,
  ContenidoClase,
  Justificante,
  ConversacionIA,
  MensajeIA,
  Movimiento,
  DispositivoPush,
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
