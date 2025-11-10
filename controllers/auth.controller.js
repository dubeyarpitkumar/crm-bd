const { prisma } = require('../prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../services/email.service'); // 1. sendEmail को import करें

// 1. उपयोगकर्ता को रजिस्टर करने के लिए फ़ंक्शन
exports.register = async (req, res) => {
  const { email, name, password } = req.body;

  try {
    // पासवर्ड को हैश (Hash) करना
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // नए उपयोगकर्ता (User) को डेटाबेस में बनाना
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    // 2. वेलकम ई-मेल भेजें
    // 4. (बिना 'await' के) - यह बैकग्राउंड में चलेगा
    //    ताकि API प्रतिक्रिया (response) में देरी न हो।
    sendEmail(
      user.email,
      'Welcome to CRM!',
      `Hi ${user.name},\n\nYour account has been created successfully.\n\nWelcome aboard!`
    ); //

    // प्रतिक्रिया (Response) से पासवर्ड हटाना
    const { password: _, ...userWithoutPassword } = user;

    // 201 Created स्थिति के साथ नए उपयोगकर्ता का डेटा भेजना
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'यह ईमेल पहले से मौजूद है।' });
    }
    res.status(500).json({ message: 'सर्वर एरर', error: error.message });
  }
};

// 2. उपयोगकर्ता को लॉग इन करने के लिए फ़ंक्शन (कोई बदलाव नहीं)
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: 'उपयोगकर्ता नहीं मिला।' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'अमान्य क्रेडेंशियल (Invalid credentials)।' });
    }

    const payload = {
      userId: user.id,
      role: user.role,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ message: 'सर्वर एरर', error: error.message });
  }
};