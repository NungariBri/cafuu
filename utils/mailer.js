const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 🔐 Email verification
const sendVerificationEmail = async (to, code) => {
  const mailOptions = {
    from: `Cafeteria System <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify Your Email',
    text: `Your verification code is: ${code}`
  };
await transporter.sendMail(mailOptions);
console.log(`📧 Sent to ${to}: ${mailOptions.text}`);
};

// 🔔 New meal availability notification
const sendNotificationEmail = async (to, message) => {
  const mailOptions = {
    from: `Cafeteria System <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Cafeteria Update 🍽️',
    text: message
  };
  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail,
  sendNotificationEmail
};
