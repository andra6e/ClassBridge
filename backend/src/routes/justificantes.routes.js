const { Router } = require('express');
const ctrl = require('../controllers/justificantes.controller');
const { autenticar } = require('../middleware/auth.middleware');
const { permitir } = require('../middleware/roles.middleware');
const { validar } = require('../middleware/validar.middleware');
const { esquemaCrearJustificante, esquemaRevisarJustificante } = require('../validators/justificante.validator');

const router = Router();

// Padre crea justificante
router.post('/', autenticar, permitir('padre'), validar(esquemaCrearJustificante), ctrl.crearJustificante);

// Maestro lista pendientes
router.get('/pendientes', autenticar, permitir('maestro', 'admin'), ctrl.listarPendientes);

// Maestro revisa (aprueba/rechaza)
router.post('/:id_justificante/revisar', autenticar, permitir('maestro', 'admin'), validar(esquemaRevisarJustificante), ctrl.revisarJustificante);

module.exports = router;
