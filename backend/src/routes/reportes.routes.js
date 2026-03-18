const { Router } = require('express');
const { autenticar } = require('../middleware/auth.middleware');
const { permitir } = require('../middleware/roles.middleware');
const ctrl = require('../controllers/reportes.controller');

const router = Router();

router.use(autenticar);
router.get('/admin', permitir('admin'), ctrl.estadisticasAdmin);
router.get('/resumen-diario', permitir('admin'), ctrl.resumenDiario);
router.get('/resumen-diario-maestro', permitir('maestro'), ctrl.resumenDiarioMaestro);

module.exports = router;
