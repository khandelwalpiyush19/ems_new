
import nodemailer from 'nodemailer';

const sendWelcomeEmail = async (email, name) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // or another service
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Email options
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Welcome to Our App!',
    html: `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to Paarsiv</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #1e1e2f;
      margin: 0;
      padding: 0;
      color: #e0e0e0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #2b2b3c;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    }
    .header {
      text-align: center;
      color: #7c9eff;
    }
    .message {
      font-size: 16px;
      color: #dddddd;
      line-height: 1.6;
    }
    .password-box {
      background-color: #383850;
      padding: 14px;
      font-weight: bold;
      font-size: 18px;
      color: #ff6e91;
      text-align: center;
      border-radius: 6px;
      margin: 20px 0;
    }
    .footer {
      font-size: 14px;
      color: #888888;
      text-align: center;
      margin-top: 30px;
    }
    a {
      color: #9dc1ff;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2 class="header">Welcome to Paarsiv!</h2>
    <p class="message">
      Hello, ${name}!
    </p>
    <p class="message">
      Your account has been successfully created by the Paarsiv Admin Team. You are now part of our employee network.
    </p>
    <p class="message">
      Use the default password below to log in for the first time:
    </p>
    <div class="password-box">Paarsiv@3053</div>
    <p class="message">
      <strong>Security Notice:</strong> Please reset your password immediately after your first login to ensure account safety.
    </p>
    <p class="message">
      Need help? Contact your administrator or reach out to <a href="mailto:support@paarsiv.com">support@paarsiv.com</a>.
    </p>
    <div class="footer">
      &copy; 2025 Paarsiv. All rights reserved.
    </div>
  </div>
</body>
</html>


    `,
  };

  // Send email
  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export default sendWelcomeEmail;