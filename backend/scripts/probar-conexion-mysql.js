/**
 * Prueba rápida de conexión a MySQL (misma config que el backend).
 * Ejecutar: node scripts/probar-conexion-mysql.js
 * Si falla, revisa que XAMPP MySQL esté en marcha y que la BD "classbridge" exista.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mysql = require('mysql2/promise');

const host = (process.env.DB_HOST === 'localhost') ? '127.0.0.1' : (process.env.DB_HOST || '127.0.0.1');
const port = parseInt(process.env.DB_PORT, 10) || 3306;
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'classbridge';

async function probar() {
  console.log('Conectando a MySQL:', { host, port, user, database });
  try {
    const conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      connectTimeout: 10000,
    });
    await conn.ping();
    console.log('[OK] Conexión a MySQL correcta. La base de datos está accesible.');
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('[ERROR] No se pudo conectar a MySQL:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('   -> Asegúrate de que MySQL esté iniciado en XAMPP (puerto', port + ').');
    }
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   -> Usuario o contraseña incorrectos. Revisa DB_USER y DB_PASSWORD en .env');
    }
    if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('   -> La base de datos "' + database + '" no existe. Ejecuta las migraciones.');
    }
    process.exit(1);
  }
}

probar();
