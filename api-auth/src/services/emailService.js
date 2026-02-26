// src/services/emailService.js
const nodemailer = require('nodemailer');

/**
 * Create email transporter optimized for SendGrid
 * Using Single Sender Verification
 */
const createTransporter = () => {
  console.log('📧 Initializing SendGrid SMTP transporter...');
  
  // SendGrid SMTP Configuration
  const transportConfig = {
    host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.SMTP_USER || 'apikey', // SendGrid always uses 'apikey'
      pass: process.env.SMTP_PASSWORD // Your SendGrid API Key
    },
    // Important for SendGrid
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: true // Verify SSL certificate in production
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000
  };

  // Enable debug logging in development
  if (process.env.NODE_ENV === 'development') {
    transportConfig.debug = true;
    transportConfig.logger = true;
  }

  const transporter = nodemailer.createTransport(transportConfig);
  
  console.log('✅ SendGrid transporter created');
  return transporter;
};

/**
 * Get the verified "from" email address
 * MUST match your SendGrid Single Sender Verification email
 */
const getFromAddress = () => {
  const fromName = process.env.SENDGRID_FROM_NAME || process.env.EMAIL_FROM_NAME || 'Your App';
  const fromEmail = process.env.SENDGRID_FROM_EMAIL; // MUST be verified in SendGrid
  
  if (!fromEmail) {
    console.error('❌ ERROR: SENDGRID_FROM_EMAIL not set in .env');
    throw new Error('SENDGRID_FROM_EMAIL must be configured and verified in SendGrid');
  }
  
  console.log(`📧 Sending from: "${fromName}" <${fromEmail}>`);
  return `"${fromName}" <${fromEmail}>`;
};

/**
 * Send OTP email via SendGrid
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {string} name - User's name
 * @param {string} type - OTP type (password_change, email_verification, password_reset)
 */
const sendOTPEmail = async (email, otp, name, type = 'password_change') => {
  try {
    console.log(`\n📨 Preparing to send ${type} OTP email...`);
    console.log(`📬 Recipient: ${email}`);
    console.log(`👤 Name: ${name}`);
    console.log(`🔐 OTP: ${otp}`);
    
    const transporter = createTransporter();

    // Email subjects based on type
    const subjects = {
      password_change: 'Password Change Verification Code',
      email_verification: 'Email Verification Code',
      password_reset: 'Password Reset Code'
    };

    // Email content based on type
    const messages = {
      password_change: {
        title: 'Password Change Request',
        description: 'You have requested to change your password. Please use the following verification code:',
        color: '#4CAF50',
        icon: '🔒',
        warning: "If you didn't request this change, please ignore this email or contact support."
      },
      email_verification: {
        title: 'Email Verification',
        description: 'Please use the following code to verify your email address:',
        color: '#2196F3',
        icon: '✉️',
        warning: "If you didn't sign up for an account, you can safely ignore this email."
      },
      password_reset: {
        title: 'Password Reset Request',
        description: 'You have requested to reset your password. Use this code to proceed:',
        color: '#FF9800',
        icon: '🔑',
        warning: "If you didn't request this, please secure your account immediately."
      }
    };

    const messageData = messages[type] || messages.password_change;

    const mailOptions = {
      from: getFromAddress(), // MUST be your verified SendGrid email
      to: email,
      subject: subjects[type] || subjects.password_change,
      
      // HTML version
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subjects[type]}</title>
          <!--[if mso]>
          <style type="text/css">
            body, table, td {font-family: Arial, sans-serif !important;}
          </style>
          <![endif]-->
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f7fa;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 100%;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 40px; text-align: center;">
                      <div style="font-size: 48px; margin-bottom: 10px;">${messageData.icon}</div>
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                        Security Verification
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 50px 40px;">
                      <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                        ${messageData.title}
                      </h2>
                      
                      <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 10px 0;">
                        Hi <strong style="color: #1a1a1a;">${name}</strong>,
                      </p>
                      
                      <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        ${messageData.description}
                      </p>
                      
                      <!-- OTP Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                        <tr>
                          <td style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border: 3px dashed ${messageData.color}; border-radius: 12px; padding: 40px 30px; text-align: center;">
                            <div style="color: ${messageData.color}; font-size: 48px; font-weight: 700; letter-spacing: 12px; font-family: 'Courier New', Courier, monospace; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">
                              ${otp}
                            </div>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Expiration Warning -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 8px; margin: 0 0 25px 0;">
                        <tr>
                          <td style="padding: 20px;">
                            <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.5;">
                              <strong>⏰ Important:</strong> This verification code will expire in <strong>10 minutes</strong>. Please use it soon.
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 30px 0;">
                        ${messageData.warning}
                      </p>
                      
                      <!-- Security Tips -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #e7f3ff 0%, #cfe9ff 100%); border-radius: 8px; margin: 0;">
                        <tr>
                          <td style="padding: 25px;">
                            <p style="color: #004085; margin: 0 0 15px 0; font-size: 15px; font-weight: 600;">
                              🛡️ Security Tips:
                            </p>
                            <ul style="color: #004085; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                              <li style="margin-bottom: 8px;">Never share this verification code with anyone</li>
                              <li style="margin-bottom: 8px;">Our support team will never ask for this code</li>
                              <li style="margin-bottom: 0;">If you didn't request this, please contact us immediately</li>
                            </ul>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="color: #6c757d; font-size: 13px; margin: 0 0 8px 0; line-height: 1.5;">
                        This is an automated security email from <strong>${process.env.SENDGRID_FROM_NAME || 'Your App'}</strong>
                      </p>
                      <p style="color: #adb5bd; font-size: 12px; margin: 0; line-height: 1.5;">
                        Please do not reply to this email. For support, contact us through our website.
                      </p>
                      <p style="color: #adb5bd; font-size: 11px; margin: 15px 0 0 0;">
                        © ${new Date().getFullYear()} ${process.env.SENDGRID_FROM_NAME || 'Your App'}. All rights reserved.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      
      // Plain text version (important for spam filters)
      text: `
${messageData.icon} ${messageData.title}

Hi ${name},

${messageData.description}

YOUR VERIFICATION CODE: ${otp}

⏰ This code will expire in 10 minutes.

${messageData.warning}

🛡️ Security Tips:
• Never share this verification code with anyone
• Our support team will never ask for this code
• If you didn't request this, please contact us immediately

---
This is an automated security email from ${process.env.SENDGRID_FROM_NAME || 'Your App'}
Please do not reply to this email.

© ${new Date().getFullYear()} ${process.env.SENDGRID_FROM_NAME || 'Your App'}. All rights reserved.
      `.trim(),
      
      // SendGrid-specific headers (optional but recommended)
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };

    console.log('📤 Sending email via SendGrid...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📨 Response:', info.response);
    console.log('✨ Email delivered to SendGrid\n');
    
    return { 
      success: true, 
      messageId: info.messageId,
      response: info.response 
    };

  } catch (error) {
    console.error('\n❌ SENDGRID EMAIL ERROR:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // SendGrid-specific error messages
    if (error.code === 'EAUTH') {
      throw new Error('SendGrid authentication failed. Please check your API key in SMTP_PASSWORD.');
    } else if (error.responseCode === 550) {
      throw new Error('Sender email not verified in SendGrid. Please verify your Single Sender email.');
    } else if (error.code === 'ECONNECTION') {
      throw new Error('Could not connect to SendGrid. Check your internet connection.');
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('SendGrid connection timed out. Please try again.');
    } else {
      throw new Error(`SendGrid error: ${error.message}`);
    }
  }
};

/**
 * Send welcome email via SendGrid
 * @param {string} email - Recipient email
 * @param {string} name - User's name
 */
const sendWelcomeEmail = async (email, name) => {
  try {
    console.log(`\n📨 Sending welcome email to: ${email}`);
    
    const transporter = createTransporter();

    const mailOptions = {
      from: getFromAddress(),
      to: email,
      subject: `Welcome to ${process.env.SENDGRID_FROM_NAME || 'Our Platform'}! 🎉`,
      
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome!</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f7fa;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 40px; text-align: center;">
                      <div style="font-size: 64px; margin-bottom: 15px;">🎉</div>
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 600;">
                        Welcome Aboard!
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 50px 40px;">
                      <h2 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 26px;">
                        Hi ${name}! 👋
                      </h2>
                      
                      <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        We're thrilled to have you join <strong>${process.env.SENDGRID_FROM_NAME || 'our platform'}</strong>! Your account has been successfully created.
                      </p>
                      
                      <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        You're all set to start exploring and making the most of your new account.
                      </p>
                      
                      <!-- Next Steps -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 10px; margin: 0 0 30px 0;">
                        <tr>
                          <td style="padding: 35px;">
                            <h3 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
                              🚀 Get Started
                            </h3>
                            <ul style="color: #4a5568; margin: 0; padding-left: 25px; font-size: 15px; line-height: 2;">
                              <li>✨ Complete your profile information</li>
                              <li>📸 Upload a profile picture</li>
                              <li>🔍 Explore all available features</li>
                              <li>🎯 Start using the platform</li>
                            </ul>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                        If you have any questions or need assistance, don't hesitate to reach out. We're here to help make your experience amazing!
                      </p>
                      
                      <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0;">
                        Best regards,<br>
                        <strong style="color: #667eea;">The ${process.env.SENDGRID_FROM_NAME || 'Team'}</strong>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="color: #6c757d; font-size: 13px; margin: 0 0 8px 0;">
                        You're receiving this email because you created an account.
                      </p>
                      <p style="color: #adb5bd; font-size: 11px; margin: 0;">
                        © ${new Date().getFullYear()} ${process.env.SENDGRID_FROM_NAME || 'Your App'}. All rights reserved.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      
      text: `
🎉 Welcome to ${process.env.SENDGRID_FROM_NAME || 'Our Platform'}!

Hi ${name}!

We're thrilled to have you join us! Your account has been successfully created.

🚀 Get Started:
• Complete your profile information
• Upload a profile picture
• Explore all available features
• Start using the platform

If you have any questions, feel free to reach out.

Best regards,
The ${process.env.SENDGRID_FROM_NAME || 'Team'}

© ${new Date().getFullYear()} ${process.env.SENDGRID_FROM_NAME || 'Your App'}
      `.trim()
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully');
    console.log('📧 Message ID:', info.messageId);
    
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    // Don't throw error for welcome email - it's not critical
    return { success: false, error: error.message };
  }
};

/**
 * Verify SendGrid SMTP connection
 * Call this on server startup to ensure configuration is correct
 */
const verifyConnection = async () => {
  try {
    console.log('\n🔍 Verifying SendGrid SMTP connection...');
    console.log('Host:', process.env.SMTP_HOST || 'smtp.sendgrid.net');
    console.log('Port:', process.env.SMTP_PORT || 587);
    console.log('User:', process.env.SMTP_USER || 'apikey');
    console.log('From Email:', process.env.SENDGRID_FROM_EMAIL);
    
    const transporter = createTransporter();
    await transporter.verify();
    
    console.log('✅ SendGrid SMTP connection verified successfully!');
    console.log('✅ Ready to send emails\n');
    
    return { success: true, message: 'SendGrid SMTP connection is working' };
  } catch (error) {
    console.error('\n❌ SendGrid SMTP verification failed!');
    console.error('Error:', error.message);
    console.error('\nPlease check:');
    console.error('1. SMTP_PASSWORD contains valid SendGrid API key');
    console.error('2. SENDGRID_FROM_EMAIL is verified in SendGrid dashboard');
    console.error('3. API key has "Mail Send" permissions\n');
    
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  verifyConnection,
  createTransporter,
  getFromAddress
};