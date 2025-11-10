const jwt = require('jsonwebtoken');
const { prisma } = require('../prisma/client');

// 'protect' मिडलवेयर फ़ंक्शन
exports.protect = async (req, res, next) => {
  let token;

  try {
    // 1. हेडर से 'Bearer' टोकन की जाँच करना
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // 2. टोकन को 'Bearer ' स्ट्रिंग से अलग करना
      token = req.headers.authorization.split(' ')[1];

      // 3. टोकन को वेरिफाई (Verify) करना
      // यह .env से JWT_SECRET का उपयोग करके टोकन को डिकोड करता है
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. डिकोड किए गए 'userId' से उपयोगकर्ता (User) को ढूँढना
      // हम पासवर्ड को प्रतिक्रिया (response) से बाहर रखते हैं
      req.user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // 5. यदि उपयोगकर्ता मिल जाता है, तो अगले मिडलवेयर या कंट्रोलर पर जाएँ
      if (req.user) {
        next();
      } else {
        // यदि उपयोगकर्ता DB में नहीं मिलता है (जैसे, टोकन पुराना है और यूज़र डिलीट हो गया है)
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
    } else {
      // 6. यदि कोई टोकन नहीं है या वह 'Bearer' से शुरू नहीं होता है
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
  } catch (error) {
    // यदि jwt.verify विफल होता है (जैसे, टोकन अमान्य या एक्सपायर हो गया है)
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};