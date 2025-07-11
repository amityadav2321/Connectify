// utils/resend.js
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = async ({ to, subject, html }) => {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',     
      to:'itsamityadav2307@gmail.com',
      subject,
      html,
      reply_to: 'itsamityadav2307@gmail.com',   
    });
    console.log('✅ Email sent:', data);
    return data;
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw error;
  }
};

module.exports = sendMail;
