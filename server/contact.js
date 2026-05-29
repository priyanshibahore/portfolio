const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Load environment variables dynamically
require('dotenv').config();

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  // Simple validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields (name, email, message) are required.' });
  }

  // Check if SMTP details are configured in .env
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, RECEIVER_EMAIL } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !RECEIVER_EMAIL) {
    console.warn('SMTP settings are missing in the .env file. Falling back to console log simulation.');
    
    // Simulate sending email (highly useful for local dev setup testing!)
    console.log('=========================================');
    console.log('📧 CONTACT FORM SUBMISSION (SIMULATION)');
    console.log(`From: ${name} <${email}>`);
    console.log(`Message: ${message}`);
    console.log('=========================================');
    
    return res.json({ 
      success: true, 
      simulated: true, 
      message: 'Message received! (SMTP not configured in .env; check server console logs for details).' 
    });
  }

  try {
    // Create mail transport connection
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });

    // Premium HTML Email Template styled in theme colors (purple palette)
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f7f5fd;
            color: #1a1a2e;
            padding: 30px 15px;
            margin: 0;
          }
          .card {
            background: #ffffff;
            border-radius: 16px;
            padding: 35px;
            box-shadow: 0 8px 32px rgba(123, 94, 167, 0.08);
            max-width: 580px;
            margin: 0 auto;
            border: 1px solid rgba(123, 94, 167, 0.12);
          }
          h2 {
            color: #7b5ea7;
            font-size: 1.4rem;
            margin-top: 0;
            margin-bottom: 25px;
            border-bottom: 2px solid #ede9f7;
            padding-bottom: 12px;
            letter-spacing: -0.01em;
          }
          .field {
            margin-bottom: 20px;
          }
          .label {
            font-weight: 700;
            color: #6b6b8a;
            font-size: 0.78rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 6px;
          }
          .value {
            font-size: 0.98rem;
            color: #1a1a2e;
            background: #fdfcff;
            padding: 14px 18px;
            border-radius: 10px;
            border-left: 4px solid #7b5ea7;
            line-height: 1.5;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.01);
          }
          .value a {
            color: #7b5ea7;
            text-decoration: none;
            font-weight: 600;
          }
          .value a:hover {
            text-decoration: underline;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 0.75rem;
            color: #9b7fca;
            border-top: 1px solid #ede9f7;
            padding-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>✦ New Portfolio Message</h2>
          
          <div class="field">
            <div class="label">Sender Name</div>
            <div class="value">${name}</div>
          </div>
          
          <div class="field">
            <div class="label">Sender Email</div>
            <div class="value"><a href="mailto:${email}">${email}</a></div>
          </div>
          
          <div class="field">
            <div class="label">Message Details</div>
            <div class="value" style="white-space: pre-wrap;">${message}</div>
          </div>
          
          <div class="footer">
            Sent automatically from your <strong>Priyanshi Bahore Portfolio Server</strong>.
          </div>
        </div>
      </body>
      </html>
    `;

    // Mail options
    const mailOptions = {
      from: `"${name}" <${SMTP_USER}>`, // Send through configured email
      to: RECEIVER_EMAIL,
      replyTo: email, // Directly reply to sender
      subject: `✦ Portfolio Contact from ${name}`,
      html: htmlContent,
      text: `New Portfolio Message\n\nName: ${name}\nEmail: ${email}\nMessage:\n${message}`
    };

    // Send email
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Message sent and emailed successfully!' });

  } catch (err) {
    console.error('SMTP Email Error:', err);
    res.status(500).json({ error: 'Failed to dispatch email. Check server configuration logs.' });
  }
});

module.exports = router;
