const { Router } = require('express');
const ctrl = require('../controllers/asistencia.controller');
const { autenticar } = require('../middleware/auth.middleware');
const { permitir } = require('../middleware/roles.middleware');
const { validar } = require('../middleware/validar.middleware');
const { esquemaGuardarAsistencia } = require('../validators/asistencia.validator');

const router = Router();

router.post('/guardar', autenticar, permitir('maestro', 'admin'), validar(esquemaGuardarAsistencia), ctrl.guardarAsistencia);

module.exports = router;
