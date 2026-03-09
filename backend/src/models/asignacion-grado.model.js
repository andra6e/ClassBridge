const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AsignacionGrado = sequelize.define('AsignacionGrado', {
    id_asignacion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_maestro: { type: DataTypes.INTEGER, allowNull: false },
    id_grado: { type: DataTypes.INTEGER, allowNull: false },
    anio_escolar: { type: DataTypes.STRING(9), allowNull: false },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'asignacion_grado',
  });

  AsignacionGrado.associate = (modelos) => {
    AsignacionGrado.belongsTo(modelos.Usuario, { foreignKey: 'id_maestro', as: 'maestro' });
    AsignacionGrado.belongsTo(modelos.Grado, { foreignKey: 'id_grado', as: 'grado' });
  };

  return AsignacionGrado;
};
