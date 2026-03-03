const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Asistencia = sequelize.define('Asistencia', {
    id_asistencia: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_sesion: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    id_estudiante: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM('presente', 'ausente', 'tarde', 'justificado'),
      allowNull: false,
      defaultValue: 'presente',
    },
    notas: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    registrado_por: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    registrado_en: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'asistencia',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'registrado_en',
    updatedAt: 'actualizado_en',
  });

  Asistencia.associate = (modelos) => {
    Asistencia.belongsTo(modelos.SesionClase, { foreignKey: 'id_sesion', as: 'sesion' });
    Asistencia.belongsTo(modelos.Estudiante, { foreignKey: 'id_estudiante', as: 'estudiante' });
    Asistencia.belongsTo(modelos.Usuario, { foreignKey: 'registrado_por', as: 'registrador' });
    Asistencia.hasOne(modelos.JustificanteAusencia, { foreignKey: 'id_asistencia', as: 'justificante' });
  };

  return Asistencia;
};
