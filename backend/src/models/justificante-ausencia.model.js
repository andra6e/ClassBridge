const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const JustificanteAusencia = sequelize.define('JustificanteAusencia', {
    id_justificante: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_asistencia: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    id_padre: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    motivo: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    url_adjunto: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    nombre_adjunto: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado'),
      allowNull: false,
      defaultValue: 'pendiente',
    },
    revisado_por: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    revisado_en: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notas_revision: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    enviado_en: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'justificantes_ausencia',
    freezeTableName: true,
    timestamps: false,
  });

  JustificanteAusencia.associate = (modelos) => {
    JustificanteAusencia.belongsTo(modelos.Asistencia, { foreignKey: 'id_asistencia', as: 'asistencia' });
    JustificanteAusencia.belongsTo(modelos.Padre, { foreignKey: 'id_padre', as: 'padre' });
    JustificanteAusencia.belongsTo(modelos.Usuario, { foreignKey: 'revisado_por', as: 'revisor' });
  };

  return JustificanteAusencia;
};
