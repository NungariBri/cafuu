const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  
    pass: process.env.EMAIL_PASS  // App password, not your login password
  }
});

const sendVerificationEmail = async (to, code) => {
    const mailOptions = {
        from: `Cafeteria System <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Verify Your Email',
        text: `Your verification code is: ${code}`
      };
      
  await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;
