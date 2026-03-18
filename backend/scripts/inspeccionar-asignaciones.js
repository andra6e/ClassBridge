require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'classbridge',
  });

  const [users] = await conn.query("SELECT id_usuario, nombre_completo, correo, rol, activo FROM usuarios WHERE rol='maestro' ORDER BY id_usuario");
  console.log('MAESTROS =>');
  console.table(users);

  const [asigs] = await conn.query("SELECT a.id_asignacion, a.id_maestro, u.nombre_completo, g.nombre AS grado, a.anio_escolar, a.activo FROM asignacion_grado a JOIN usuarios u ON u.id_usuario = a.id_maestro JOIN grados g ON g.id_grado = a.id_grado ORDER BY a.id_maestro, a.id_grado");
  console.log('ASIGNACIONES =>');
  console.table(asigs);

  await conn.end();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
