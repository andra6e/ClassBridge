const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PadreEstudiante = sequelize.define('PadreEstudiante', {
    id_padre: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
    },
    id_estudiante: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
    },
    relacion: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'padre',
    },
    es_principal: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    tableName: 'padre_estudiante',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'creado_en',
    updatedAt: false,
  });

  return PadreEstudiante;
};
