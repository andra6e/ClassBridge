const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SesionClase = sequelize.define('SesionClase', {
    id_sesion: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_grupo: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    fecha_sesion: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    creado_por: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  }, {
    tableName: 'sesiones_clase',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'creado_en',
    updatedAt: false,
  });

  SesionClase.associate = (modelos) => {
    SesionClase.belongsTo(modelos.GrupoClase, { foreignKey: 'id_grupo', as: 'grupo' });
    SesionClase.belongsTo(modelos.Usuario, { foreignKey: 'creado_por', as: 'creador' });
    SesionClase.hasMany(modelos.Asistencia, { foreignKey: 'id_sesion', as: 'asistencias' });
    SesionClase.hasOne(modelos.ContenidoClase, { foreignKey: 'id_sesion', as: 'contenido' });
  };

  return SesionClase;
};
