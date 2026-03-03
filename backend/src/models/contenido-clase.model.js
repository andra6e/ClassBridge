const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ContenidoClase = sequelize.define('ContenidoClase', {
    id_contenido: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_sesion: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    resumen: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    notas_extra: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    subido_por: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  }, {
    tableName: 'contenido_clase',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'creado_en',
    updatedAt: 'actualizado_en',
  });

  ContenidoClase.associate = (modelos) => {
    ContenidoClase.belongsTo(modelos.SesionClase, { foreignKey: 'id_sesion', as: 'sesion' });
    ContenidoClase.belongsTo(modelos.Usuario, { foreignKey: 'subido_por', as: 'subidor' });
    ContenidoClase.hasMany(modelos.AdjuntoContenido, { foreignKey: 'id_contenido', as: 'adjuntos' });
  };

  return ContenidoClase;
};
