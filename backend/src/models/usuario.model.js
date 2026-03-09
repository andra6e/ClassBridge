const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre_completo: { type: DataTypes.STRING(120), allowNull: false },
    correo: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    hash_contrasena: { type: DataTypes.STRING(255), allowNull: false },
    rol: { type: DataTypes.ENUM('admin', 'maestro', 'padre'), allowNull: false },
    telefono: { type: DataTypes.STRING(20), allowNull: true },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
    ultimo_login_en: { type: DataTypes.DATE, allowNull: true },
  }, {
    tableName: 'usuarios',
  });

  Usuario.associate = (modelos) => {
    Usuario.hasMany(modelos.Matricula, { foreignKey: 'id_padre', as: 'matriculasComoPadre' });
    Usuario.hasMany(modelos.AsignacionGrado, { foreignKey: 'id_maestro', as: 'asignaciones' });
    Usuario.hasMany(modelos.Asistencia, { foreignKey: 'registrado_por', as: 'asistenciasRegistradas' });
    Usuario.hasMany(modelos.ContenidoClase, { foreignKey: 'registrado_por', as: 'contenidosRegistrados' });
    Usuario.hasMany(modelos.Justificante, { foreignKey: 'enviado_por', as: 'justificantesEnviados' });
    Usuario.hasMany(modelos.Justificante, { foreignKey: 'revisado_por', as: 'justificantesRevisados' });
  };

  return Usuario;
};
