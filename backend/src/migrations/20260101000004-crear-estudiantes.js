'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('estudiantes', {
      id_estudiante: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      id_escuela: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'escuelas', key: 'id_escuela' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      nombre_completo: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      codigo_matricula: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      fecha_nacimiento: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      sexo: {
        type: Sequelize.ENUM('M', 'F', 'O'),
        allowNull: true,
      },
      nivel_grado: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      creado_en: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      actualizado_en: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('estudiantes', ['codigo_matricula'], {
      name: 'idx_estudiantes_codigo_matricula',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('estudiantes');
  },
};
