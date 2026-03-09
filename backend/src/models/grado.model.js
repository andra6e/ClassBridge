const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Grado = sequelize.define('Grado', {
    id_grado: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(30), allowNull: false },
    orden: { type: DataTypes.TINYINT, allowNull: false, unique: true },
  }, {
    tableName: 'grados',
  });

  Grado.associate = (modelos) => {
    Grado.hasMany(modelos.AsignacionGrado, { foreignKey: 'id_grado', as: 'asignaciones' });
    Grado.hasMany(modelos.Matricula, { foreignKey: 'id_grado', as: 'matriculas' });
    Grado.hasMany(modelos.Asistencia, { foreignKey: 'id_grado', as: 'asistencias' });
    Grado.hasMany(modelos.ContenidoClase, { foreignKey: 'id_grado', as: 'contenidos' });
  };

  return Grado;
};
