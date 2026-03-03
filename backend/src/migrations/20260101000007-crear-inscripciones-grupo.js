'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inscripciones_grupo', {
      id_grupo: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        references: { model: 'grupos_clase', key: 'id_grupo' },
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
      inscrito_en: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      retirado_en: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('inscripciones_grupo');
  },
};
