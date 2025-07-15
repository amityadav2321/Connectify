// utils/resend.js
const { Resend } = require('resend');

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is missing from environment variables.");
}

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = async ({ to, subject, html }) => {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to,
      subject,
      html,
      reply_to: 'itsamityadav2307@gmail.com',
    });

    return data;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

module.exports = sendMail;
