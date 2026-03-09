'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mensajes_ia', {
      id_mensaje: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_conversacion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'conversaciones_ia', key: 'id_conversacion' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      rol: {
        type: Sequelize.ENUM('user', 'assistant'),
        allowNull: false,
      },
      contenido: {
        type: Sequelize.TEXT,
        allowNull: false,
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('mensajes_ia');
  },
};
