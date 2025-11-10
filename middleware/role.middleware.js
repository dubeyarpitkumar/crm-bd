/**
 * 'authorize' (अधिकृत करें) एक "Higher-Order Function" (HOF) है।
 * यह एक फ़ंक्शन है जो एक नया फ़ंक्शन (मिडलवेयर) लौटाता है।
 *
 * 1. हम इसे अपने routes में इस तरह इस्तेमाल करते हैं: authorize('ADMIN', 'MANAGER')
 * 2. यह 'allowedRoles' (जैसे ['ADMIN', 'MANAGER']) को "closure" (क्लोजर) में याद रखता है।
 * 3. यह नीचे दिए गए (inner) मिडलवेयर फ़ंक्शन को एक्सप्रेस (Express) को लौटाता है।
 * 4. एक्सप्रेस तब उस (inner) फ़ंक्शन को (req, res, next) के साथ कॉल करता है।
 */
exports.authorize = (...allowedRoles) => {
  // 1. यह (inner) मिडलवेयर फ़ंक्शन है जिसे एक्सप्रेस (Express) चलाएगा।
  return (req, res, next) => {
    // 2. हम मानते हैं कि 'protect' मिडलवेयर पहले ही चल चुका है
    //    और उसने 'req.user' को अटैच कर दिया है।
    if (!req.user) {
      // यह स्थिति नहीं आनी चाहिए यदि 'protect' सही तरीके से कॉन्फ़िगर किया गया है,
      // लेकिन यह एक अतिरिक्त सुरक्षा जाँच है।
      return res.status(401).json({ message: 'Not authorized' });
    }

    // 3. जाँच करें कि क्या उपयोगकर्ता की भूमिका (role) उन भूमिकाओं में शामिल है
    //    जिन्हें इस रूट के लिए अनुमति दी गई है।
    const hasPermission = allowedRoles.includes(req.user.role);

    if (!hasPermission) {
      // 4. यदि उपयोगकर्ता के पास अनुमति नहीं है, तो 403 (Forbidden) भेजें।
      return res.status(403).json({
        message: 'Forbidden: You do not have the required permissions',
      });
    }

    // 5. यदि उपयोगकर्ता के पास अनुमति है, तो अगले मिडलवेयर पर जाएँ।
    next();
  };
};