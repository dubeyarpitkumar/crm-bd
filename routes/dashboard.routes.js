const express = require('express');
const {
  getStats,
  getLeadsByStatus,
  getTopSalesExecutives,
} = require('../controllers/dashboard.controller.js');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// 5. राउटर का instance बनाना
const router = express.Router();

// 6. सभी डैशबोर्ड Routes के लिए कॉमन (Common) मिडलवेयर
// 'router.use()' इस फ़ाइल में डिफाइन किए गए सभी routes पर लागू होगा।
// यह सुनिश्चित करता है कि केवल लॉग-इन (protect) और अधिकृत (authorize)
// उपयोगकर्ता (ADMIN या MANAGER) ही इन endpoints को एक्सेस कर सकते हैं।
router.use(protect);
router.use(authorize(['ADMIN', 'MANAGER']));

// --- Dashboard API Routes ---
// (ये routes अब /api/dashboard/stats, आदि पर उपलब्ध होंगे)

// 7. GET /stats
router.get('/stats', getStats);

// 8. GET /leads-by-status
router.get('/leads-by-status', getLeadsByStatus);

// 9. GET /top-sales
router.get('/top-sales', getTopSalesExecutives);

// 10. राउटर को एक्सपोर्ट करना
module.exports = router;