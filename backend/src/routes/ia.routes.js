const { Router } = require('express');
const ctrl = require('../controllers/ia.controller');
const { autenticar } = require('../middleware/auth.middleware');
const { permitir } = require('../middleware/roles.middleware');
const { validar } = require('../middleware/validar.middleware');
const { esquemaChat } = require('../validators/ia.validator');
const { limitadorIA } = require('../middleware/rateLimit.middleware');

const router = Router();

router.post('/chat', autenticar, permitir('padre'), limitadorIA, validar(esquemaChat), ctrl.chat);

module.exports = router;
