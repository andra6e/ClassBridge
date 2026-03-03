const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Escuela = sequelize.define('Escuela', {
    id_escuela: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    direccion: {
      type: DataTypes.STRING(300),
      allowNull: true,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    correo: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    url_logo: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    activa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    tableName: 'escuelas',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'creado_en',
    updatedAt: 'actualizado_en',
  });

  Escuela.associate = (modelos) => {
    Escuela.hasMany(modelos.Usuario, { foreignKey: 'id_escuela', as: 'usuarios' });
    Escuela.hasMany(modelos.Padre, { foreignKey: 'id_escuela', as: 'padres' });
    Escuela.hasMany(modelos.Estudiante, { foreignKey: 'id_escuela', as: 'estudiantes' });
    Escuela.hasMany(modelos.GrupoClase, { foreignKey: 'id_escuela', as: 'grupos' });
  };

  return Escuela;
};
