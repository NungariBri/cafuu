const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'yourgmail@gmail.com',
    pass: 'your-app-password' // App password, not your login password
  }
});

const sendVerificationEmail = async (to, code) => {
  const mailOptions = {
    from: 'Cafeteria System <yourgmail@gmail.com>',
    to,
    subject: 'Verify Your Email',
    text: `Your verification code is: ${code}`
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;
