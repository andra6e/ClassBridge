const { Router } = require('express');
const { autenticar } = require('../middleware/auth.middleware');
const { permitir } = require('../middleware/roles.middleware');
const { validar } = require('../middleware/validar.middleware');
const { esquemaCrearJustificante, esquemaRevisarJustificante } = require('../validators/justificante.validator');
const ctrl = require('../controllers/justificantes.controller');

const router = Router();

router.post('/', autenticar, permitir('padre'), validar(esquemaCrearJustificante), ctrl.crearJustificante);
router.get('/pendientes', autenticar, permitir('maestro'), ctrl.listarPendientes);
router.patch('/:id/revisar', autenticar, permitir('maestro'), validar(esquemaRevisarJustificante), ctrl.revisarJustificante);

module.exports = router;
