const nodemailer = require('nodemailer');

// 1. Nodemailer 'transport' (ट्रांसपोर्ट) को कॉन्फ़िगर करना
// यह .env फ़ाइल से आपके SMTP सर्वर (जैसे SendGrid, Mailtrap) की डिटेल्स को पढ़ता है
const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * एक ई-मेल भेजता है।
 * @param {string} to - प्राप्तकर्ता (Recipient) का ई-मेल एड्रेस
 * @param {string} subject - ई-मेल का विषय (Subject)
 * @param {string} text - ई-मेल का प्लेन टेक्स्ट कंटेंट (Content)
 */
exports.sendEmail = async (to, subject, text) => {
  try {
    // 3. ई-मेल के विकल्पों (Options) को डिफाइन करना
    const mailOptions = {
      from: 'CRM Admin <noreply@crm.com>', // 5. 'From' एड्रेस
      to: to,
      subject: subject,
      text: text,
      // (वैकल्पिक: आप 'text' के बजाय HTML भी भेज सकते हैं)
      // html: `<b>${text}</b>`
    };

    // 4. `transport.sendMail` का उपयोग करके ई-मेल भेजना
    const info = await transport.sendMail(mailOptions);

    // 6. सफलता (Success) को लॉग करना
    console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
  } catch (error) {
    // 7. एरर को लॉग करना
    console.error(`Error sending email to ${to}: ${error.message}`);
  }
};