const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Padre = sequelize.define('Padre', {
    id_padre: {
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
    tableName: 'padres',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'creado_en',
    updatedAt: 'actualizado_en',
  });

  Padre.associate = (modelos) => {
    Padre.belongsTo(modelos.Escuela, { foreignKey: 'id_escuela', as: 'escuela' });
    Padre.belongsToMany(modelos.Estudiante, {
      through: modelos.PadreEstudiante,
      foreignKey: 'id_padre',
      otherKey: 'id_estudiante',
      as: 'hijos',
    });
    Padre.hasMany(modelos.JustificanteAusencia, { foreignKey: 'id_padre', as: 'justificantes' });
  };

  return Padre;
};
