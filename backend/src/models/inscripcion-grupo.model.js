const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InscripcionGrupo = sequelize.define('InscripcionGrupo', {
    id_grupo: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
    },
    id_estudiante: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
    },
    inscrito_en: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    retirado_en: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'inscripciones_grupo',
    freezeTableName: true,
    timestamps: false,
  });

  InscripcionGrupo.associate = (modelos) => {
    InscripcionGrupo.belongsTo(modelos.Estudiante, { foreignKey: 'id_estudiante', as: 'estudiante' });
    InscripcionGrupo.belongsTo(modelos.GrupoClase, { foreignKey: 'id_grupo', as: 'grupo' });
  };

  return InscripcionGrupo;
};
