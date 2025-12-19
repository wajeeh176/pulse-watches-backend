// Simple test to verify nodemailer is installed correctly
const nodemailer = require('nodemailer');

console.log('Nodemailer version:', nodemailer.version);
console.log('Type of createTransporter:', typeof nodemailer.createTransporter);

// Test creating a transporter
try {
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: 'test@gmail.com',
      pass: 'testpass',
    },
  });
  console.log('✅ Transporter created successfully!');
  console.log('Transporter type:', typeof transporter);
} catch (error) {
  console.error('❌ Error creating transporter:', error);
}

