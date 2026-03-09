const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ContenidoClase = sequelize.define('ContenidoClase', {
    id_contenido: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_grado: { type: DataTypes.INTEGER, allowNull: false },
    id_materia: { type: DataTypes.INTEGER, allowNull: false },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    tema: { type: DataTypes.STRING(200), allowNull: false },
    explicacion: { type: DataTypes.TEXT, allowNull: false },
    actividades: { type: DataTypes.TEXT, allowNull: true },
    registrado_por: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    tableName: 'contenido_clase',
  });

  ContenidoClase.associate = (modelos) => {
    ContenidoClase.belongsTo(modelos.Grado, { foreignKey: 'id_grado', as: 'grado' });
    ContenidoClase.belongsTo(modelos.Materia, { foreignKey: 'id_materia', as: 'materia' });
    ContenidoClase.belongsTo(modelos.Usuario, { foreignKey: 'registrado_por', as: 'registrador' });
    ContenidoClase.hasMany(modelos.ConversacionIA, { foreignKey: 'id_contenido', as: 'conversaciones' });
  };

  return ContenidoClase;
};
