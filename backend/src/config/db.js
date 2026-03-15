const { Sequelize } = require('sequelize');
require('dotenv').config();

const entorno = process.env.NODE_ENV || 'development';
const config = require('./config')[entorno];

// En Windows, 'localhost' a veces resuelve a IPv6 y MySQL puede colgarse; forzar IPv4
const host = config.host === 'localhost' ? '127.0.0.1' : config.host;

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password || '',
  {
    host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    define: config.define,
    dialectOptions: {
      connectTimeout: 10000,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 20000,
      idle: 10000,
      evict: 5000,
    },
  }
);

module.exports = sequelize;
