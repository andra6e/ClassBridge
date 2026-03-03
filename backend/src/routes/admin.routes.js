const { Router } = require('express');
const ctrl = require('../controllers/admin.controller');
const { autenticar } = require('../middleware/auth.middleware');
const { permitir } = require('../middleware/roles.middleware');
const { validar } = require('../middleware/validar.middleware');
const v = require('../validators/admin.validator');

const router = Router();

router.use(autenticar, permitir('admin'));

// Maestros
router.get('/maestros', ctrl.listarMaestros);
router.post('/maestros', validar(v.esquemaCrearMaestro), ctrl.crearMaestro);
router.patch('/maestros/:id_usuario/estado', validar(v.esquemaCambiarEstado), ctrl.cambiarEstadoMaestro);

// Grupos
router.get('/grupos', ctrl.listarGrupos);
router.post('/grupos', validar(v.esquemaCrearGrupo), ctrl.crearGrupo);
router.patch('/grupos/:id_grupo/asignar-maestro', validar(v.esquemaAsignarMaestro), ctrl.asignarMaestro);

// Estudiantes
router.get('/estudiantes', ctrl.listarEstudiantes);
router.post('/estudiantes', validar(v.esquemaCrearEstudiante), ctrl.crearEstudiante);
router.patch('/estudiantes/:id_estudiante/estado', validar(v.esquemaCambiarEstado), ctrl.cambiarEstadoEstudiante);

// Matriculas
router.get('/grupos/:id_grupo/inscritos', ctrl.listarInscritos);
router.post('/matriculas', validar(v.esquemaMatricula), ctrl.matricularEstudiante);
router.patch('/matriculas/retirar', validar(v.esquemaMatricula), ctrl.retirarEstudiante);

// Padres
router.post('/padres', validar(v.esquemaCrearPadre), ctrl.crearPadre);
router.post('/vincular-padre-estudiante', validar(v.esquemaVincularPadre), ctrl.vincularPadreEstudiante);

module.exports = router;
