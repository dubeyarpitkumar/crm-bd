// prisma/client.js
const { PrismaClient } = require('@prisma/client');

// PrismaClient का एक 'global' (वैश्विक) instance बनाना।
// डेवलपमेंट (development) के दौरान, 'hot reloading' (तुरंत रीलोड)
// बार-बार नए PrismaClient instance बना सकता है, जिससे कनेक्शन पूल (pool) खत्म हो सकते हैं।
// हम इसे 'globalThis' पर स्टोर करके इससे बचते हैं।

const globalForPrisma = globalThis;

// globalThis पर 'prisma' को चेक करना।
// यदि यह मौजूद नहीं है, तो एक नया PrismaClient instance बनाना।
const prisma = globalForPrisma.prisma || new PrismaClient();

// यदि हम प्रोडक्शन (production) में नहीं हैं, तो globalThis.prisma को
// हमारे बनाए गए instance पर सेट करना।
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// पूरे एप्लिकेशन में उपयोग के लिए सिंगल instance को एक्सपोर्ट करना।
// यह सुनिश्चित करता है कि आपका एप्लिकेशन डेटाबेस के साथ
// केवल एक कनेक्शन पूल (connection pool) का प्रबंधन करता है।
module.exports = {
  prisma,
};