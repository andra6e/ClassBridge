'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sesiones_clase', {
      id_sesion: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      id_grupo: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'grupos_clase', key: 'id_grupo' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      fecha_sesion: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      creado_por: {
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

    await queryInterface.addIndex('sesiones_clase', ['id_grupo', 'fecha_sesion'], {
      unique: true,
      name: 'uq_sesiones_grupo_fecha',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sesiones_clase');
  },
};
