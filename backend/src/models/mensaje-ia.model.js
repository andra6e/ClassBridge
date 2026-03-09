const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MensajeIA = sequelize.define('MensajeIA', {
    id_mensaje: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_conversacion: { type: DataTypes.INTEGER, allowNull: false },
    rol: { type: DataTypes.ENUM('user', 'assistant'), allowNull: false },
    contenido: { type: DataTypes.TEXT, allowNull: false },
  }, {
    tableName: 'mensajes_ia',
  });

  MensajeIA.associate = (modelos) => {
    MensajeIA.belongsTo(modelos.ConversacionIA, { foreignKey: 'id_conversacion', as: 'conversacion' });
  };

  return MensajeIA;
};
