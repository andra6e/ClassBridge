'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('asignacion_grado', {
      id_asignacion: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_maestro: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id_usuario' },
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
      anio_escolar: {
        type: Sequelize.STRING(9),
        allowNull: false,
      },
      activo: {
        type: Sequelize.BOOLEAN,
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
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addConstraint('asignacion_grado', {
      fields: ['id_grado', 'anio_escolar'],
      type: 'unique',
      name: 'uq_asignacion_grado_anio',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('asignacion_grado', 'uq_asignacion_grado_anio');
    await queryInterface.dropTable('asignacion_grado');
  },
};
