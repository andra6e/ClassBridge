const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rutas = require('./routes');
const manejadorErrores = require('./middleware/errores.middleware');

const app = express();

// Seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parseo de body
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (_req, res) => {
  res.json({ ok: true, mensaje: 'API ClassBridge funcionando', data: { version: '1.0.0' } });
});

// Rutas de la API
app.use('/api', rutas);

// 404
app.use((_req, res) => {
  res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada', data: null });
});

// Manejo centralizado de errores
app.use(manejadorErrores);

module.exports = app;
