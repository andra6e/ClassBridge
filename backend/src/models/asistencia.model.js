const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Asistencia = sequelize.define('Asistencia', {
    id_asistencia: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_estudiante: { type: DataTypes.INTEGER, allowNull: false },
    id_grado: { type: DataTypes.INTEGER, allowNull: false },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    estado: { type: DataTypes.ENUM('presente', 'ausente'), allowNull: false },
    registrado_por: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    tableName: 'asistencia',
  });

  Asistencia.associate = (modelos) => {
    Asistencia.belongsTo(modelos.Estudiante, { foreignKey: 'id_estudiante', as: 'estudiante' });
    Asistencia.belongsTo(modelos.Grado, { foreignKey: 'id_grado', as: 'grado' });
    Asistencia.belongsTo(modelos.Usuario, { foreignKey: 'registrado_por', as: 'registrador' });
    Asistencia.hasOne(modelos.Justificante, { foreignKey: 'id_asistencia', as: 'justificante' });
  };

  return Asistencia;
};
