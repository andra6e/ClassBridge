const { Router } = require('express');
const ctrl = require('../controllers/auth.controller');
const { validar } = require('../middleware/validar.middleware');
const { esquemaLogin, esquemaRefresh } = require('../validators/auth.validator');
const { limitadorAuth } = require('../middleware/rateLimit.middleware');

const router = Router();

router.post('/login',        limitadorAuth, validar(esquemaLogin), ctrl.login);
router.post('/login-padre',  limitadorAuth, validar(esquemaLogin), ctrl.loginPadre);
router.post('/refresh',      validar(esquemaRefresh), ctrl.refresh);
router.post('/logout',       ctrl.logout);

module.exports = router;
