const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Materia = sequelize.define('Materia', {
    id_materia: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  }, {
    tableName: 'materias',
  });

  Materia.associate = (modelos) => {
    Materia.hasMany(modelos.ContenidoClase, { foreignKey: 'id_materia', as: 'contenidos' });
  };

  return Materia;
};
