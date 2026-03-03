const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const GrupoClase = sequelize.define('GrupoClase', {
    id_grupo: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_escuela: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    materia: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    nivel_grado: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    anio_escolar: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    id_maestro: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    tableName: 'grupos_clase',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'creado_en',
    updatedAt: 'actualizado_en',
  });

  GrupoClase.associate = (modelos) => {
    GrupoClase.belongsTo(modelos.Escuela, { foreignKey: 'id_escuela', as: 'escuela' });
    GrupoClase.belongsTo(modelos.Usuario, { foreignKey: 'id_maestro', as: 'maestro' });
    GrupoClase.belongsToMany(modelos.Estudiante, {
      through: modelos.InscripcionGrupo,
      foreignKey: 'id_grupo',
      otherKey: 'id_estudiante',
      as: 'estudiantes',
    });
    GrupoClase.hasMany(modelos.SesionClase, { foreignKey: 'id_grupo', as: 'sesiones' });
  };

  return GrupoClase;
};
