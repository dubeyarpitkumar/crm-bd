const express = require('express');
const { register, login } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware'); // 2. authorize को import करें

// एक्सप्रेस राउटर का एक नया instance बनाना
const router = express.Router();

// Public Routes (सार्वजनिक)
router.post('/register', register);
router.post('/login', login);

// Protected Route (सभी लॉग-इन उपयोगकर्ताओं के लिए)
// 3. GET /me route (जैसा था वैसा ही)
router.get('/me', protect, (req, res) => {
  res.status(200).json(req.user);
});

// Protected AND Authorized Route (सिर्फ ADMIN के लिए)
// 4. GET /admin-test
router.get(
  '/admin-test',
  protect, // 5. पहले जाँचता है कि उपयोगकर्ता लॉग-इन है या नहीं
  authorize('ADMIN'), // 5. फिर जाँचता है कि क्या उपयोगकर्ता की भूमिका 'ADMIN' है
  (req, res) => {
    // 6. यदि दोनों जाँच पास हो जाती हैं, तो यह प्रतिक्रिया भेजी जाती है
    res.status(200).json({ message: 'Welcome, Admin!' });
  }
);

// राउटर को एक्सपोर्ट (Export) करना
module.exports = router;