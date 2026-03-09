const { Router } = require('express');
const { autenticar } = require('../middleware/auth.middleware');
const { permitir } = require('../middleware/roles.middleware');
const { validar } = require('../middleware/validar.middleware');
const {
  esquemaCrearMaestro,
  esquemaCrearPadre,
  esquemaCrearEstudiante,
  esquemaCrearMatricula,
  esquemaCrearAsignacion,
  esquemaPromocionIndividual,
  esquemaPromocionGrado,
  esquemaRegistrarFamilia,
} = require('../validators/admin.validator');
const ctrl = require('../controllers/admin.controller');

const router = Router();

router.use(autenticar, permitir('admin'));

router.get('/maestros', ctrl.listarMaestros);
router.post('/maestros', validar(esquemaCrearMaestro), ctrl.crearMaestro);
router.patch('/maestros/:id', ctrl.toggleMaestro);

router.get('/padres', ctrl.listarPadres);
router.get('/padres/:id', ctrl.obtenerPadre);
router.post('/padres', validar(esquemaCrearPadre), ctrl.crearPadre);

router.get('/estudiantes', ctrl.listarEstudiantes);
router.post('/estudiantes', validar(esquemaCrearEstudiante), ctrl.crearEstudiante);

router.get('/grados', ctrl.listarGrados);

router.get('/matriculas', ctrl.listarMatriculas);
router.post('/matriculas', validar(esquemaCrearMatricula), ctrl.crearMatricula);
router.post('/familias', validar(esquemaRegistrarFamilia), ctrl.registrarFamilia);

router.post('/asignaciones', validar(esquemaCrearAsignacion), ctrl.crearAsignacion);
router.delete('/asignaciones/:id', ctrl.eliminarAsignacion);

router.post('/promocion/individual', validar(esquemaPromocionIndividual), ctrl.promocionIndividual);
router.post('/promocion/grado', validar(esquemaPromocionGrado), ctrl.promocionGrado);

module.exports = router;
