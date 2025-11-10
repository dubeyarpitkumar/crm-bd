const express = require('express');
const authRoutes = require('./auth.routes');
const leadRoutes = require('./lead.routes.js');
const dashboardRoutes = require('./dashboard.routes.js'); // 3. dashboardRoutes को import करें

// मुख्य राउटर का एक instance बनाना
const router = express.Router();

// 1. /api/auth path पर authRoutes को 'mount' (माउंट) करना
router.use('/auth', authRoutes);

// 2. /api/leads path पर leadRoutes को 'mount' (माउंट) करना
router.use('/leads', leadRoutes);

// 3. /api/dashboard path पर dashboardRoutes को 'mount' (माउंट) करना
router.use('/dashboard', dashboardRoutes);

// मुख्य राउटर को एक्सपोर्ट करना
module.exports = router;