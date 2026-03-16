const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DispositivoPush = sequelize.define('DispositivoPush', {
    id_dispositivo: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_usuario: { type: DataTypes.INTEGER, allowNull: false },
    rol: { type: DataTypes.ENUM('admin', 'maestro', 'padre'), allowNull: false },
    token: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    plataforma: { type: DataTypes.ENUM('android', 'ios', 'web'), allowNull: false, defaultValue: 'android' },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
    ultimo_registro_en: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'dispositivos_push',
  });

  DispositivoPush.associate = (modelos) => {
    DispositivoPush.belongsTo(modelos.Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
  };

  return DispositivoPush;
};
