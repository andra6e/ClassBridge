const { Router } = require('express');
const ctrl = require('../controllers/padres.controller');
const { autenticar } = require('../middleware/auth.middleware');
const { permitir } = require('../middleware/roles.middleware');

const router = Router();

router.get('/:id_estudiante/asistencia', autenticar, permitir('padre'), ctrl.historialAsistencia);

module.exports = router;
