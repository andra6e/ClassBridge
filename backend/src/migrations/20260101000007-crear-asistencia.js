'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('asistencia', {
      id_asistencia: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
        onDelete: 'CASCADE',
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      estado: {
        type: Sequelize.ENUM('presente', 'ausente'),
        allowNull: false,
      },
      registrado_por: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id_usuario' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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

    await queryInterface.addConstraint('asistencia', {
      fields: ['id_estudiante', 'fecha'],
      type: 'unique',
      name: 'uq_asistencia_estudiante_fecha',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('asistencia', 'uq_asistencia_estudiante_fecha');
    await queryInterface.dropTable('asistencia');
  },
};
