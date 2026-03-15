require('dotenv').config();

const app = require('./app');
const { sequelize } = require('./database');
const logger = require('./utils/logger');

const PUERTO = process.env.PORT || 3000;

async function iniciar() {
  try {
    await sequelize.authenticate();
    logger.info('Conexion a la base de datos establecida correctamente.');

    app.listen(PUERTO, () => {
      logger.info(`Servidor corriendo en http://localhost:${PUERTO}`);
    });
  } catch (err) {
    logger.error('Error al conectar con la base de datos:', err.message);
    if (err.message && err.message.includes('timeout')) {
      logger.error('Sugerencia: Comprueba que MySQL (XAMPP) esté en ejecución. Prueba: node scripts/probar-conexion-mysql.js');
    }
    process.exit(1);
  }
}

iniciar();
