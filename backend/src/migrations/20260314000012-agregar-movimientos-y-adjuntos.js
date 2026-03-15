'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('movimientos', {
      id_movimiento: {
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
      accion: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },
      detalle: {
        type: Sequelize.TEXT,
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
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addColumn('justificantes', 'archivo_nombre', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn('justificantes', 'archivo_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
    await queryInterface.addColumn('justificantes', 'archivo_mime', {
      type: Sequelize.STRING(120),
      allowNull: true,
    });

    await queryInterface.addColumn('contenido_clase', 'tipo_contenido', {
      type: Sequelize.ENUM('materia', 'general'),
      allowNull: false,
      defaultValue: 'materia',
    });
    await queryInterface.changeColumn('contenido_clase', 'id_materia', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'materias', key: 'id_materia' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    await queryInterface.addColumn('contenido_clase', 'archivo_nombre', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn('contenido_clase', 'archivo_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
    await queryInterface.addColumn('contenido_clase', 'archivo_mime', {
      type: Sequelize.STRING(120),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('contenido_clase', 'archivo_mime');
    await queryInterface.removeColumn('contenido_clase', 'archivo_url');
    await queryInterface.removeColumn('contenido_clase', 'archivo_nombre');
    await queryInterface.removeColumn('contenido_clase', 'tipo_contenido');

    await queryInterface.removeColumn('justificantes', 'archivo_mime');
    await queryInterface.removeColumn('justificantes', 'archivo_url');
    await queryInterface.removeColumn('justificantes', 'archivo_nombre');

    await queryInterface.dropTable('movimientos');
  },
};
