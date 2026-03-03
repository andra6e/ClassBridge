'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('padre_estudiante', {
      id_padre: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        references: { model: 'padres', key: 'id_padre' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_estudiante: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        references: { model: 'estudiantes', key: 'id_estudiante' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      relacion: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: 'padre',
      },
      es_principal: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      creado_en: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('padre_estudiante');
  },
};
