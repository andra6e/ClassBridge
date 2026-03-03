'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('padres', {
      id_padre: {
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
      correo: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true,
      },
      hash_contrasena: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      url_avatar: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      ultimo_login_en: {
        type: Sequelize.DATE,
        allowNull: true,
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('padres');
  },
};
