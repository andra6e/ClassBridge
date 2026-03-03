const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Estudiante = sequelize.define('Estudiante', {
    id_estudiante: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_escuela: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    nombre_completo: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    codigo_matricula: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    fecha_nacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    sexo: {
      type: DataTypes.ENUM('M', 'F', 'O'),
      allowNull: true,
    },
    nivel_grado: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    tableName: 'estudiantes',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'creado_en',
    updatedAt: 'actualizado_en',
  });

  Estudiante.associate = (modelos) => {
    Estudiante.belongsTo(modelos.Escuela, { foreignKey: 'id_escuela', as: 'escuela' });
    Estudiante.belongsToMany(modelos.Padre, {
      through: modelos.PadreEstudiante,
      foreignKey: 'id_estudiante',
      otherKey: 'id_padre',
      as: 'padresTutores',
    });
    Estudiante.belongsToMany(modelos.GrupoClase, {
      through: modelos.InscripcionGrupo,
      foreignKey: 'id_estudiante',
      otherKey: 'id_grupo',
      as: 'grupos',
    });
    Estudiante.hasMany(modelos.Asistencia, { foreignKey: 'id_estudiante', as: 'asistencias' });
  };

  return Estudiante;
};
