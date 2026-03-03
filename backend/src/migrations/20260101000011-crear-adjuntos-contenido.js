'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('adjuntos_contenido', {
      id_adjunto: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      id_contenido: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'contenido_clase', key: 'id_contenido' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      nombre_archivo: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      tipo_archivo: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      url_archivo: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      tamano_kb: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      texto_extraido: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      },
      subido_por: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'usuarios', key: 'id_usuario' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      creado_en: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('adjuntos_contenido');
  },
};
