'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const ahora = new Date();
    const hashAdmin = await bcrypt.hash('Admin123!', 10);
    const hashMaestro = await bcrypt.hash('Maestro123!', 10);
    const hashPadre = await bcrypt.hash('Padre123!', 10);

    // 1. Escuela
    await queryInterface.bulkInsert('escuelas', [{
      id_escuela: 1,
      nombre: 'Escuela Primaria Benito Juarez',
      direccion: 'Av. Reforma 100, Col. Centro, CDMX',
      telefono: '5551234567',
      correo: 'contacto@benitojuarez.edu.mx',
      url_logo: null,
      activa: true,
      creado_en: ahora,
      actualizado_en: ahora,
    }]);

    // 2. Usuario admin
    await queryInterface.bulkInsert('usuarios', [{
      id_usuario: 1,
      id_escuela: 1,
      nombre_completo: 'Carlos Lopez Rivera',
      correo: 'admin@classbridge.com',
      hash_contrasena: hashAdmin,
      rol: 'admin',
      telefono: '5559876543',
      url_avatar: null,
      activo: true,
      ultimo_login_en: null,
      creado_en: ahora,
      actualizado_en: ahora,
    }]);

    // 3. Usuario maestro
    await queryInterface.bulkInsert('usuarios', [{
      id_usuario: 2,
      id_escuela: 1,
      nombre_completo: 'Maria Fernanda Garcia',
      correo: 'maestra@classbridge.com',
      hash_contrasena: hashMaestro,
      rol: 'maestro',
      telefono: '5551112233',
      url_avatar: null,
      activo: true,
      ultimo_login_en: null,
      creado_en: ahora,
      actualizado_en: ahora,
    }]);

    // 4. Padre
    await queryInterface.bulkInsert('padres', [{
      id_padre: 1,
      id_escuela: 1,
      nombre_completo: 'Roberto Hernandez Perez',
      correo: 'padre@classbridge.com',
      hash_contrasena: hashPadre,
      telefono: '5554445566',
      url_avatar: null,
      activo: true,
      ultimo_login_en: null,
      creado_en: ahora,
      actualizado_en: ahora,
    }]);

    // 5. Estudiante
    await queryInterface.bulkInsert('estudiantes', [{
      id_estudiante: 1,
      id_escuela: 1,
      nombre_completo: 'Sofia Hernandez Martinez',
      codigo_matricula: 'MAT-2026-001',
      fecha_nacimiento: '2015-03-12',
      sexo: 'F',
      nivel_grado: '5to Primaria',
      activo: true,
      creado_en: ahora,
      actualizado_en: ahora,
    }]);

    // 6. Vinculacion padre-estudiante
    await queryInterface.bulkInsert('padre_estudiante', [{
      id_padre: 1,
      id_estudiante: 1,
      relacion: 'padre',
      es_principal: true,
      creado_en: ahora,
    }]);

    // 7. Grupo de clase
    await queryInterface.bulkInsert('grupos_clase', [{
      id_grupo: 1,
      id_escuela: 1,
      nombre: '5-A Matematicas',
      materia: 'Matematicas',
      nivel_grado: '5to Primaria',
      anio_escolar: '2025-2026',
      id_maestro: 2,
      activo: true,
      creado_en: ahora,
      actualizado_en: ahora,
    }]);

    // 8. Inscripcion del estudiante al grupo
    await queryInterface.bulkInsert('inscripciones_grupo', [{
      id_grupo: 1,
      id_estudiante: 1,
      inscrito_en: ahora,
      retirado_en: null,
    }]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('inscripciones_grupo', null, {});
    await queryInterface.bulkDelete('grupos_clase', null, {});
    await queryInterface.bulkDelete('padre_estudiante', null, {});
    await queryInterface.bulkDelete('estudiantes', null, {});
    await queryInterface.bulkDelete('padres', null, {});
    await queryInterface.bulkDelete('usuarios', null, {});
    await queryInterface.bulkDelete('escuelas', null, {});
  },
};
