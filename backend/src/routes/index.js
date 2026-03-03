const { Router } = require('express');

const authRoutes = require('./auth.routes');
const gruposRoutes = require('./grupos.routes');
const asistenciaRoutes = require('./asistencia.routes');
const contenidoRoutes = require('./contenido.routes');
const adjuntosRoutes = require('./adjuntos.routes');
const padresRoutes = require('./padres.routes');
const estudiantesRoutes = require('./estudiantes.routes');
const justificantesRoutes = require('./justificantes.routes');
const iaRoutes = require('./ia.routes');
const adminRoutes = require('./admin.routes');
const reportesRoutes = require('./reportes.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/grupos', gruposRoutes);
router.use('/asistencia', asistenciaRoutes);
router.use('/contenido', contenidoRoutes);
router.use('/adjuntos', adjuntosRoutes);
router.use('/padres', padresRoutes);
router.use('/estudiantes', estudiantesRoutes);
router.use('/justificantes', justificantesRoutes);
router.use('/ia', iaRoutes);
router.use('/reportes', reportesRoutes);

module.exports = router;
