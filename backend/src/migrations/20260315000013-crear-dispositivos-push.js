'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dispositivos_push', {
      id_dispositivo: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id_usuario' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      rol: {
        type: Sequelize.ENUM('admin', 'maestro', 'padre'),
        allowNull: false,
      },
      token: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      plataforma: {
        type: Sequelize.ENUM('android', 'ios', 'web'),
        allowNull: false,
        defaultValue: 'android',
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      ultimo_registro_en: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
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

    await queryInterface.addIndex('dispositivos_push', ['id_usuario', 'activo'], {
      name: 'idx_dispositivos_push_usuario_activo',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('dispositivos_push', 'idx_dispositivos_push_usuario_activo');
    await queryInterface.dropTable('dispositivos_push');
  },
};
