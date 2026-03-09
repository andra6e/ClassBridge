const { Router } = require('express');
const { autenticar } = require('../middleware/auth.middleware');
const { permitir } = require('../middleware/roles.middleware');
const ctrl = require('../controllers/reportes.controller');

const router = Router();

router.use(autenticar, permitir('admin'));
router.get('/admin', ctrl.estadisticasAdmin);

module.exports = router;
