'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const ahora = new Date();

    await queryInterface.bulkInsert('grados', [
      { id_grado: 1, nombre: '1er Grado', orden: 1, creado_en: ahora, actualizado_en: ahora },
      { id_grado: 2, nombre: '2do Grado', orden: 2, creado_en: ahora, actualizado_en: ahora },
      { id_grado: 3, nombre: '3er Grado', orden: 3, creado_en: ahora, actualizado_en: ahora },
      { id_grado: 4, nombre: '4to Grado', orden: 4, creado_en: ahora, actualizado_en: ahora },
      { id_grado: 5, nombre: '5to Grado', orden: 5, creado_en: ahora, actualizado_en: ahora },
      { id_grado: 6, nombre: '6to Grado', orden: 6, creado_en: ahora, actualizado_en: ahora },
    ]);

    await queryInterface.bulkInsert('materias', [
      { nombre: 'Español', creado_en: ahora, actualizado_en: ahora },
      { nombre: 'Inglés', creado_en: ahora, actualizado_en: ahora },
      { nombre: 'Matemáticas', creado_en: ahora, actualizado_en: ahora },
      { nombre: 'Ciencias', creado_en: ahora, actualizado_en: ahora },
      { nombre: 'Sociales', creado_en: ahora, actualizado_en: ahora },
      { nombre: 'Tecnología', creado_en: ahora, actualizado_en: ahora },
      { nombre: 'Educación Física', creado_en: ahora, actualizado_en: ahora },
      { nombre: 'Naturales', creado_en: ahora, actualizado_en: ahora },
    ]);

    await queryInterface.bulkInsert('usuarios', [
      {
        id_usuario: 1,
        nombre_completo: 'Carlos Lopez Rivera',
        correo: 'admin@classbridge.com',
        hash_contrasena: await bcrypt.hash('Admin123!', 10),
        rol: 'admin',
        telefono: '5559876543',
        activo: true,
        creado_en: ahora,
        actualizado_en: ahora,
      },
      {
        id_usuario: 2,
        nombre_completo: 'Maria Fernanda Garcia',
        correo: 'maestra@classbridge.com',
        hash_contrasena: await bcrypt.hash('Maestro123!', 10),
        rol: 'maestro',
        telefono: '5551112233',
        activo: true,
        creado_en: ahora,
        actualizado_en: ahora,
      },
      {
        id_usuario: 3,
        nombre_completo: 'Roberto Hernandez Perez',
        correo: 'padre@classbridge.com',
        hash_contrasena: await bcrypt.hash('Padre123!', 10),
        rol: 'padre',
        telefono: '5554445566',
        activo: true,
        creado_en: ahora,
        actualizado_en: ahora,
      },
    ]);

    await queryInterface.bulkInsert('estudiantes', [
      {
        id_estudiante: 1,
        nombre_completo: 'Sofia Hernandez Martinez',
        fecha_nacimiento: '2015-03-12',
        sexo: 'F',
        activo: true,
        creado_en: ahora,
        actualizado_en: ahora,
      },
    ]);

    await queryInterface.bulkInsert('matriculas', [
      {
        id_matricula: 1,
        id_padre: 3,
        id_estudiante: 1,
        id_grado: 3,
        anio_escolar: '2025-2026',
        estado: 'activa',
        creado_en: ahora,
        actualizado_en: ahora,
      },
    ]);

    await queryInterface.bulkInsert('asignacion_grado', [
      {
        id_asignacion: 1,
        id_maestro: 2,
        id_grado: 3,
        anio_escolar: '2025-2026',
        activo: true,
        creado_en: ahora,
        actualizado_en: ahora,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('asignacion_grado', null, {});
    await queryInterface.bulkDelete('matriculas', null, {});
    await queryInterface.bulkDelete('estudiantes', null, {});
    await queryInterface.bulkDelete('usuarios', null, {});
    await queryInterface.bulkDelete('materias', null, {});
    await queryInterface.bulkDelete('grados', null, {});
  },
};
