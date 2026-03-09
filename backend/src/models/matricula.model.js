const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Matricula = sequelize.define('Matricula', {
    id_matricula: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_padre: { type: DataTypes.INTEGER, allowNull: false },
    id_estudiante: { type: DataTypes.INTEGER, allowNull: false },
    id_grado: { type: DataTypes.INTEGER, allowNull: false },
    anio_escolar: { type: DataTypes.STRING(9), allowNull: false },
    estado: { type: DataTypes.ENUM('activa', 'retirada', 'graduada'), defaultValue: 'activa' },
  }, {
    tableName: 'matriculas',
  });

  Matricula.associate = (modelos) => {
    Matricula.belongsTo(modelos.Usuario, { foreignKey: 'id_padre', as: 'padre' });
    Matricula.belongsTo(modelos.Estudiante, { foreignKey: 'id_estudiante', as: 'estudiante' });
    Matricula.belongsTo(modelos.Grado, { foreignKey: 'id_grado', as: 'grado' });
  };

  return Matricula;
};
