const { Router } = require('express');
const { autenticar } = require('../middleware/auth.middleware');
const { permitir } = require('../middleware/roles.middleware');
const ctrl = require('../controllers/padres.controller');

const router = Router();

router.use(autenticar, permitir('padre'));

router.get('/hijos', ctrl.listarHijos);
router.get('/hijos/:id_estudiante/asistencia', ctrl.historialAsistencia);
router.get('/hijos/:id_estudiante/contenido-pendiente', ctrl.contenidoPendiente);
router.get('/notificaciones', ctrl.listarNotificaciones);

module.exports = router;
