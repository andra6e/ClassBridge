const { Router } = require('express');
const { limitadorAuth } = require('../middleware/rateLimit.middleware');
const { validar } = require('../middleware/validar.middleware');
const { autenticar } = require('../middleware/auth.middleware');
const { esquemaLogin, esquemaRefresh, esquemaVerificarContrasena } = require('../validators/auth.validator');
const ctrl = require('../controllers/auth.controller');

const router = Router();

router.post('/login', limitadorAuth, validar(esquemaLogin), ctrl.login);
router.post('/refresh', validar(esquemaRefresh), ctrl.refresh);
router.post('/logout', ctrl.logout);
router.post('/verificar-contrasena', autenticar, validar(esquemaVerificarContrasena), ctrl.verificarContrasena);

module.exports = router;
