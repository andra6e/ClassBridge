const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Justificante = sequelize.define('Justificante', {
    id_justificante: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_asistencia: { type: DataTypes.INTEGER, allowNull: false },
    motivo: { type: DataTypes.TEXT, allowNull: false },
    estado: { type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado'), defaultValue: 'pendiente' },
    enviado_por: { type: DataTypes.INTEGER, allowNull: false },
    revisado_por: { type: DataTypes.INTEGER, allowNull: true },
    revisado_en: { type: DataTypes.DATE, allowNull: true },
    archivo_nombre: { type: DataTypes.STRING(255), allowNull: true },
    archivo_url: { type: DataTypes.STRING(500), allowNull: true },
    archivo_mime: { type: DataTypes.STRING(120), allowNull: true },
  }, {
    tableName: 'justificantes',
  });

  Justificante.associate = (modelos) => {
    Justificante.belongsTo(modelos.Asistencia, { foreignKey: 'id_asistencia', as: 'asistencia' });
    Justificante.belongsTo(modelos.Usuario, { foreignKey: 'enviado_por', as: 'emisor' });
    Justificante.belongsTo(modelos.Usuario, { foreignKey: 'revisado_por', as: 'revisor' });
  };

  return Justificante;
};
