const { Router } = require('express');
const ctrl = require('../controllers/reportes.controller');
const { autenticar } = require('../middleware/auth.middleware');
const { permitir } = require('../middleware/roles.middleware');

const router = Router();

// Reportes por grupo (maestro dueño del grupo + admin de la escuela)
router.get('/grupos/:id_grupo/asistencia-mensual',   autenticar, permitir('maestro', 'admin'), ctrl.asistenciaMensual);
router.get('/grupos/:id_grupo/inasistencias-criticas', autenticar, permitir('maestro', 'admin'), ctrl.inasistenciasCriticas);

// Resumen general de la escuela (solo admin)
router.get('/admin/escuela-resumen', autenticar, permitir('admin'), ctrl.resumenEscuela);

module.exports = router;
