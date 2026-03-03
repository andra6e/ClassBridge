const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    id_usuario: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    id_escuela: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    nombre_completo: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    correo: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    hash_contrasena: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    rol: {
      type: DataTypes.ENUM('admin', 'maestro'),
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    url_avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    ultimo_login_en: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'usuarios',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'creado_en',
    updatedAt: 'actualizado_en',
  });

  Usuario.associate = (modelos) => {
    Usuario.belongsTo(modelos.Escuela, { foreignKey: 'id_escuela', as: 'escuela' });
    Usuario.hasMany(modelos.GrupoClase, { foreignKey: 'id_maestro', as: 'gruposComoMaestro' });
    Usuario.hasMany(modelos.SesionClase, { foreignKey: 'creado_por', as: 'sesionesCreadas' });
    Usuario.hasMany(modelos.Asistencia, { foreignKey: 'registrado_por', as: 'asistenciasRegistradas' });
    Usuario.hasMany(modelos.ContenidoClase, { foreignKey: 'subido_por', as: 'contenidosSubidos' });
    Usuario.hasMany(modelos.AdjuntoContenido, { foreignKey: 'subido_por', as: 'adjuntosSubidos' });
    Usuario.hasMany(modelos.JustificanteAusencia, { foreignKey: 'revisado_por', as: 'justificantesRevisados' });
  };

  return Usuario;
};
