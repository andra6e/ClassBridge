'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('justificantes_ausencia', {
      id_justificante: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      id_asistencia: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'asistencia', key: 'id_asistencia' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_padre: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'padres', key: 'id_padre' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      motivo: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      url_adjunto: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      nombre_adjunto: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'aprobado', 'rechazado'),
        allowNull: false,
        defaultValue: 'pendiente',
      },
      revisado_por: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: 'usuarios', key: 'id_usuario' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      revisado_en: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      notas_revision: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      enviado_en: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('justificantes_ausencia', ['id_asistencia'], {
      unique: true,
      name: 'uq_justificante_asistencia',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('justificantes_ausencia');
  },
};
