const { Router } = require('express');
const ctrl = require('../controllers/contenido.controller');
const { autenticar } = require('../middleware/auth.middleware');
const { permitir } = require('../middleware/roles.middleware');
const { validar } = require('../middleware/validar.middleware');
const { esquemaContenido, esquemaAdjunto } = require('../validators/contenido.validator');

const router = Router();

router.post('/',  autenticar, permitir('maestro', 'admin'), validar(esquemaContenido), ctrl.upsertContenido);

module.exports = router;
