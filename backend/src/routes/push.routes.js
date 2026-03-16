const { Router } = require('express');
const { autenticar } = require('../middleware/auth.middleware');
const { validar } = require('../middleware/validar.middleware');
const ctrl = require('../controllers/push.controller');
const { esquemaRegistrarTokenPush, esquemaEliminarTokenPush } = require('../validators/push.validator');

const router = Router();

router.post('/token', autenticar, validar(esquemaRegistrarTokenPush), ctrl.registrarToken);
router.delete('/token', autenticar, validar(esquemaEliminarTokenPush), ctrl.eliminarToken);

module.exports = router;
