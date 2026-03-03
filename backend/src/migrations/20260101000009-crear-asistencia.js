'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('asistencia', {
      id_asistencia: {
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
      id_estudiante: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'estudiantes', key: 'id_estudiante' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      estado: {
        type: Sequelize.ENUM('presente', 'ausente', 'tarde', 'justificado'),
        allowNull: false,
        defaultValue: 'presente',
      },
      notas: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      registrado_por: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'usuarios', key: 'id_usuario' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      registrado_en: {
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

    await queryInterface.addIndex('asistencia', ['id_sesion', 'id_estudiante'], {
      unique: true,
      name: 'uq_asistencia_sesion_estudiante',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('asistencia');
  },
};
