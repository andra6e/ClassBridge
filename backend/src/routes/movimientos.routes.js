const { Router } = require('express');
const { autenticar } = require('../middleware/auth.middleware');
const { permitir } = require('../middleware/roles.middleware');
const ctrl = require('../controllers/movimientos.controller');

const router = Router();

router.get('/mios', autenticar, permitir('admin', 'maestro'), ctrl.misMovimientos);

module.exports = router;
