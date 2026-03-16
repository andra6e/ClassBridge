const { Router } = require('express');
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const maestroRoutes = require('./maestro.routes');
const padresRoutes = require('./padres.routes');
const justificantesRoutes = require('./justificantes.routes');
const iaRoutes = require('./ia.routes');
const reportesRoutes = require('./reportes.routes');
const movimientosRoutes = require('./movimientos.routes');
const pushRoutes = require('./push.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/maestro', maestroRoutes);
router.use('/padres', padresRoutes);
router.use('/justificantes', justificantesRoutes);
router.use('/ia', iaRoutes);
router.use('/reportes', reportesRoutes);
router.use('/movimientos', movimientosRoutes);
router.use('/push', pushRoutes);

module.exports = router;
