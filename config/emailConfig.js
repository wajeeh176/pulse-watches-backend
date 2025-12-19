const nodemailer = require('nodemailer');

// Create a transporter
const createTransporter = () => {
  // For development, you can use a service like Gmail, Outlook, or Ethereal (test emails)
  // For production, use a proper email service like SendGrid, Mailgun, etc.
  
  return nodemailer.createTransporter({
    service: 'gmail', // You can change this to 'outlook', 'yahoo', etc.
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
  });

  // Alternative: Using SMTP directly
  // return nodemailer.createTransporter({
  //   host: process.env.SMTP_HOST,
  //   port: process.env.SMTP_PORT,
  //   secure: false, // true for 465, false for other ports
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_PASS,
  //   },
  // });
};

// Send email function
const sendEmail = async (options) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Pulse Watches" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendEmail };

