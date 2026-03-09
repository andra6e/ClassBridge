'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contenido_clase', {
      id_contenido: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_grado: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'grados', key: 'id_grado' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_materia: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'materias', key: 'id_materia' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      tema: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      explicacion: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      actividades: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    await queryInterface.addConstraint('contenido_clase', {
      fields: ['id_grado', 'id_materia', 'fecha'],
      type: 'unique',
      name: 'uq_contenido_grado_materia_fecha',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('contenido_clase', 'uq_contenido_grado_materia_fecha');
    await queryInterface.dropTable('contenido_clase');
  },
};
