const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Estudiante = sequelize.define('Estudiante', {
    id_estudiante: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre_completo: { type: DataTypes.STRING(120), allowNull: false },
    fecha_nacimiento: { type: DataTypes.DATEONLY, allowNull: true },
    sexo: { type: DataTypes.ENUM('M', 'F'), allowNull: true },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'estudiantes',
  });

  Estudiante.associate = (modelos) => {
    Estudiante.hasMany(modelos.Matricula, { foreignKey: 'id_estudiante', as: 'matriculas' });
    Estudiante.hasMany(modelos.Asistencia, { foreignKey: 'id_estudiante', as: 'asistencias' });
    Estudiante.hasMany(modelos.ConversacionIA, { foreignKey: 'id_estudiante', as: 'conversaciones' });
  };

  return Estudiante;
};
