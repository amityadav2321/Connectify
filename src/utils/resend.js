// utils/resend.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = async ({ to, subject, html }) => {
  try {
    const data = await resend.emails.send({
      from: 'itsamityadav2307@gmail.com',
      to,
      subject,
      html,
    });
    console.log('Email sent:', data);
  } catch (error) {
    console.error('Email send error:', error);
  }
};

module.exports = sendMail;
