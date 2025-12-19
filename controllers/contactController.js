const { sendEmail } = require('../config/emailConfig');

// Handle contact form submission
exports.sendContactEmail = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Email content for the admin
    const adminEmailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #c4975b 0%, #8b6f47 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #c4975b; }
          .value { margin-top: 5px; padding: 10px; background: white; border-left: 3px solid #c4975b; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New Contact Form Submission</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">👤 Name:</div>
              <div class="value">${name}</div>
            </div>
            <div class="field">
              <div class="label">📧 Email:</div>
              <div class="value"><a href="mailto:${email}">${email}</a></div>
            </div>
            <div class="field">
              <div class="label">📝 Subject:</div>
              <div class="value">${subject}</div>
            </div>
            <div class="field">
              <div class="label">💬 Message:</div>
              <div class="value">${message}</div>
            </div>
          </div>
          <div class="footer">
            <p>This email was sent from the Pulse Watches contact form</p>
            <p>© ${new Date().getFullYear()} Pulse Watches. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Email content for the customer (auto-reply)
    const customerEmailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #c4975b 0%, #8b6f47 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .btn { display: inline-block; padding: 12px 30px; background: #c4975b; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⌚ Pulse Watches</h1>
            <p style="margin: 0;">Thank You For Contacting Us!</p>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for reaching out to Pulse Watches. We have received your message and our team will get back to you within 24-48 hours.</p>
            
            <h3 style="color: #c4975b;">Your Message Details:</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong><br>${message}</p>
            
            <p>If you have any urgent concerns, please feel free to call us at <strong>+92 300 1234567</strong> during business hours (Mon-Sat, 10AM-8PM).</p>
            
            <p style="margin-top: 30px;">Best regards,<br><strong>Pulse Watches Team</strong></p>
            
            <div style="text-align: center;">
              <a href="http://localhost:5173" class="btn">Visit Our Store</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Pulse Watches. All rights reserved.</p>
            <p>Karachi, Pakistan | support@pulsewatches.pk</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to admin
    await sendEmail({
      to: process.env.EMAIL_USER, // Admin email
      subject: `New Contact Form: ${subject}`,
      html: adminEmailHTML,
      text: `New contact form submission from ${name} (${email}):\n\nSubject: ${subject}\n\nMessage: ${message}`,
    });

    // Send auto-reply to customer
    await sendEmail({
      to: email,
      subject: 'Thank You for Contacting Pulse Watches',
      html: customerEmailHTML,
      text: `Dear ${name},\n\nThank you for contacting Pulse Watches. We have received your message and will get back to you within 24-48 hours.\n\nBest regards,\nPulse Watches Team`,
    });

    res.status(200).json({ 
      success: true, 
      message: 'Your message has been sent successfully! We will get back to you soon.' 
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message. Please try again later.' 
    });
  }
};

