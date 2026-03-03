const { Router } = require('express');
const ctrl = require('../controllers/grupos.controller');
const { autenticar } = require('../middleware/auth.middleware');
const { permitir } = require('../middleware/roles.middleware');

const router = Router();

router.get('/',                    autenticar, permitir('maestro', 'admin'), ctrl.listarGrupos);
router.get('/:id_grupo/estudiantes', autenticar, permitir('maestro', 'admin'), ctrl.listarEstudiantes);

module.exports = router;
