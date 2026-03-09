const { Router } = require('express');
const { autenticar } = require('../middleware/auth.middleware');
const { permitir } = require('../middleware/roles.middleware');
const { validar } = require('../middleware/validar.middleware');
const { limitadorIA } = require('../middleware/rateLimit.middleware');
const { esquemaIniciarConversacion, esquemaEnviarMensaje } = require('../validators/ia.validator');
const ctrl = require('../controllers/ia.controller');

const router = Router();

router.use(autenticar, permitir('padre'));

router.post('/conversaciones', validar(esquemaIniciarConversacion), ctrl.iniciarConversacion);
router.post('/chat', limitadorIA, validar(esquemaEnviarMensaje), ctrl.enviarMensaje);
router.get('/conversaciones/:id_estudiante', ctrl.listarConversaciones);

module.exports = router;
