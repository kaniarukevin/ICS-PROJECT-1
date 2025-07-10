// utils/sendEmail.js or wherever you keep it

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kevin.kaniaru@strathmore.edu',  // ✅ Actual sending address
    pass: 'derprjiouneerqiv'               // ✅ App password from Gmail
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: '"School Finder" <kevin.kaniaru@strathmore.edu>', // ✅ Match auth user
      to,
      subject,
      html
    });
    console.log('✅ Email sent:', info.messageId);
  } catch (error) {
    console.error('❌ Email send error:', error.message);
  }
};

module.exports = sendEmail;
