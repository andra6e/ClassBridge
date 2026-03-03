/**
 * Script de validacion de la base de datos.
 * Ejecutar despues de migraciones y seeders:
 *   node scripts/validar-db.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const {
  sequelize,
  Escuela,
  Usuario,
  Padre,
  Estudiante,
  GrupoClase,
  Asistencia,
} = require('../src/database');

async function validar() {
  try {
    await sequelize.authenticate();
    console.log('[OK] Conexion a la base de datos establecida.\n');

    // 1. Listar grupos del maestro
    const maestro = await Usuario.findOne({ where: { rol: 'maestro' } });
    if (maestro) {
      const grupos = await GrupoClase.findAll({
        where: { id_maestro: maestro.id_usuario },
        include: [{ association: 'estudiantes' }],
      });
      console.log(`[OK] Grupos del maestro "${maestro.nombre_completo}":`);
      grupos.forEach((g) => {
        console.log(`     - ${g.nombre} (${g.materia}) | Estudiantes: ${g.estudiantes.length}`);
      });
    } else {
      console.log('[!] No se encontro un maestro en la base de datos.');
    }

    console.log('');

    // 2. Listar hijos del padre
    const padre = await Padre.findOne({
      include: [{ association: 'hijos' }],
    });
    if (padre) {
      console.log(`[OK] Hijos del padre "${padre.nombre_completo}":`);
      padre.hijos.forEach((h) => {
        console.log(`     - ${h.nombre_completo} (${h.codigo_matricula})`);
      });
    } else {
      console.log('[!] No se encontro un padre en la base de datos.');
    }

    console.log('');

    // 3. Asistencia del estudiante (vacia al inicio)
    const estudiante = await Estudiante.findOne();
    if (estudiante) {
      const asistencias = await Asistencia.findAll({
        where: { id_estudiante: estudiante.id_estudiante },
      });
      console.log(`[OK] Asistencia de "${estudiante.nombre_completo}": ${asistencias.length} registros.`);
    } else {
      console.log('[!] No se encontro un estudiante en la base de datos.');
    }

    console.log('\n[OK] Validacion completada exitosamente.');
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Fallo la validacion:', error.message);
    process.exit(1);
  }
}

validar();
