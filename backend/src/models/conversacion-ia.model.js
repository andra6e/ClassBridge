const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ConversacionIA = sequelize.define('ConversacionIA', {
    id_conversacion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_estudiante: { type: DataTypes.INTEGER, allowNull: false },
    id_contenido: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    tableName: 'conversaciones_ia',
  });

  ConversacionIA.associate = (modelos) => {
    ConversacionIA.belongsTo(modelos.Estudiante, { foreignKey: 'id_estudiante', as: 'estudiante' });
    ConversacionIA.belongsTo(modelos.ContenidoClase, { foreignKey: 'id_contenido', as: 'contenido' });
    ConversacionIA.hasMany(modelos.MensajeIA, { foreignKey: 'id_conversacion', as: 'mensajes' });
  };

  return ConversacionIA;
};
