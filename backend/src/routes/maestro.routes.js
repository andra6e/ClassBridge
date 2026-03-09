const { Router } = require('express');
const { autenticar } = require('../middleware/auth.middleware');
const { permitir } = require('../middleware/roles.middleware');
const { validar } = require('../middleware/validar.middleware');
const { esquemaGuardarAsistencia, esquemaGuardarContenido } = require('../validators/maestro.validator');
const ctrl = require('../controllers/maestro.controller');

const router = Router();

router.use(autenticar, permitir('maestro'));

router.get('/mi-grado', ctrl.obtenerMiGrado);
router.get('/estudiantes', ctrl.listarEstudiantes);
router.post('/asistencia', validar(esquemaGuardarAsistencia), ctrl.guardarAsistencia);
router.get('/asistencia', ctrl.obtenerAsistencia);
router.post('/contenido', validar(esquemaGuardarContenido), ctrl.guardarContenido);
router.get('/contenido', ctrl.listarContenido);

module.exports = router;
