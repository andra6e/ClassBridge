'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contenido_clase', {
      id_contenido: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      id_sesion: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'sesiones_clase', key: 'id_sesion' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      titulo: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      resumen: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      notas_extra: {
        type: Sequelize.TEXT,
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
      actualizado_en: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('contenido_clase', ['id_sesion'], {
      unique: true,
      name: 'uq_contenido_sesion',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('contenido_clase');
  },
};
