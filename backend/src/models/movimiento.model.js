const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Movimiento = sequelize.define('Movimiento', {
    id_movimiento: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_usuario: { type: DataTypes.INTEGER, allowNull: false },
    rol: { type: DataTypes.ENUM('admin', 'maestro', 'padre'), allowNull: false },
    accion: { type: DataTypes.STRING(120), allowNull: false },
    detalle: { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName: 'movimientos',
  });

  Movimiento.associate = (modelos) => {
    Movimiento.belongsTo(modelos.Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
  };

  return Movimiento;
};
