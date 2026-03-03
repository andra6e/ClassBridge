const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AdjuntoContenido = sequelize.define('AdjuntoContenido', {
    id_adjunto: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_contenido: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    nombre_archivo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tipo_archivo: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    url_archivo: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    tamano_kb: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    texto_extraido: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    subido_por: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  }, {
    tableName: 'adjuntos_contenido',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'creado_en',
    updatedAt: false,
  });

  AdjuntoContenido.associate = (modelos) => {
    AdjuntoContenido.belongsTo(modelos.ContenidoClase, { foreignKey: 'id_contenido', as: 'contenido' });
    AdjuntoContenido.belongsTo(modelos.Usuario, { foreignKey: 'subido_por', as: 'subidor' });
  };

  return AdjuntoContenido;
};
