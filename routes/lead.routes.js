const express = require('express');
const {
  createLead,
  getAllLeads,
  getLeadById,
  updateLeadStatus,
  addActivity,
  // deleteLead को अगले चरण में जोड़ा जाएगा
} = require('../controllers/lead.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// 5. राउटर का instance बनाना
const router = express.Router();

// --- सभी Routes सुरक्षित हैं ---
// 'protect' मिडलवेयर को इन सभी routes पर लागू किया जाएगा,
// यह सुनिश्चित करते हुए कि केवल लॉग-इन उपयोगकर्ता ही इन्हें एक्सेस कर सकते हैं।

// 6. POST /api/leads/ - एक नई Lead बनाएँ
router.post('/', protect, createLead);

// 7. GET /api/leads/ - सभी Leads प्राप्त करें (कंट्रोलर के अंदर रोल-बेस्ड लॉजिक है)
router.get('/', protect, getAllLeads);

// 8. GET /api/leads/:id - ID द्वारा एक Lead प्राप्त करें
router.get('/:id', protect, getLeadById);

// 9. PATCH /api/leads/:id/status - एक Lead की स्थिति अपडेट करें
router.patch('/:id/status', protect, updateLeadStatus);

// 10. POST /api/leads/:id/activity - एक Lead में Activity जोड़ें
router.post('/:id/activity', protect, addActivity);

// 11. DELETE /api/leads/:id - एक Lead को डिलीट करें (सिर्फ Admin/Manager)
router.delete(
  '/:id',
  protect,
  authorize(['ADMIN', 'MANAGER']),
  (req, res) => {
    // 'deleteLead' कंट्रोलर फ़ंक्शन को यहाँ जोड़ा जाएगा
    res.status(501).json({ message: 'Delete फ़ंक्शन अभी लागू नहीं किया गया है' });
  }
);

// 12. राउटर को एक्सपोर्ट करना
module.exports = router;