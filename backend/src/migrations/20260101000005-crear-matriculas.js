'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('matriculas', {
      id_matricula: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_padre: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id_usuario' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_estudiante: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'estudiantes', key: 'id_estudiante' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_grado: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'grados', key: 'id_grado' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      anio_escolar: {
        type: Sequelize.STRING(9),
        allowNull: false,
      },
      estado: {
        type: Sequelize.ENUM('activa', 'retirada', 'graduada'),
        defaultValue: 'activa',
      },
      creado_en: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      actualizado_en: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addConstraint('matriculas', {
      fields: ['id_estudiante', 'anio_escolar'],
      type: 'unique',
      name: 'uq_matriculas_estudiante_anio',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('matriculas', 'uq_matriculas_estudiante_anio');
    await queryInterface.dropTable('matriculas');
  },
};
