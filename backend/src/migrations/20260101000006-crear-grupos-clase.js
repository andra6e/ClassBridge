'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('grupos_clase', {
      id_grupo: {
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
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      materia: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      nivel_grado: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      anio_escolar: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      id_maestro: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'usuarios', key: 'id_usuario' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('grupos_clase');
  },
};
