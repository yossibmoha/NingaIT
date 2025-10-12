/**
 * Email Service for Authentication
 * Handles password reset emails and verification emails
 */

import crypto from 'crypto';

// Email configuration
const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'noreply@ninjait.io',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
};

/**
 * Generate a secure random token
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Send password reset email
 * 
 * In production, this would integrate with:
 * - SendGrid
 * - AWS SES
 * - Mailgun
 * - Postmark
 * 
 * For development, we'll log the reset link
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName: string
): Promise<void> {
  const resetUrl = `${EMAIL_CONFIG.appUrl}/reset-password?token=${resetToken}`;
  
  const emailContent = {
    to: email,
    from: EMAIL_CONFIG.from,
    subject: 'Reset Your NinjaIT Password',
    text: `
Hello ${userName},

You requested to reset your password for your NinjaIT account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
The NinjaIT Team
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1890ff; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; background: #f5f5f5; }
    .button { 
      display: inline-block; 
      padding: 12px 30px; 
      background: #1890ff; 
      color: white; 
      text-decoration: none; 
      border-radius: 4px; 
      margin: 20px 0;
    }
    .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🥷 NinjaIT</h1>
    </div>
    <div class="content">
      <h2>Reset Your Password</h2>
      <p>Hello ${userName},</p>
      <p>You requested to reset your password for your NinjaIT account.</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" class="button">Reset Password</a>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #1890ff;">${resetUrl}</p>
      <p><strong>This link will expire in 1 hour.</strong></p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>© 2025 NinjaIT. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
  };
  
  // In development, log the email instead of sending
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with email service (SendGrid, SES, etc.)
    console.log('📧 [Email Service] Would send email:', emailContent);
    throw new Error('Email service not configured for production');
  } else {
    // Development: Log email details
    console.log('\n' + '='.repeat(80));
    console.log('📧 PASSWORD RESET EMAIL (Development Mode)');
    console.log('='.repeat(80));
    console.log(`To: ${email}`);
    console.log(`Subject: ${emailContent.subject}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('='.repeat(80) + '\n');
    
    // Simulate email delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

/**
 * Send welcome email (future feature)
 */
export async function sendWelcomeEmail(
  email: string,
  userName: string
): Promise<void> {
  const loginUrl = `${EMAIL_CONFIG.appUrl}/login`;
  
  console.log(`📧 [Email Service] Welcome email would be sent to ${email}`);
  console.log(`   Login URL: ${loginUrl}`);
  console.log(`   User: ${userName}`);
}

/**
 * Send email verification (future feature)
 */
export async function sendVerificationEmail(
  email: string,
  verificationToken: string
): Promise<void> {
  const verifyUrl = `${EMAIL_CONFIG.appUrl}/verify-email?token=${verificationToken}`;
  
  console.log(`📧 [Email Service] Verification email would be sent to ${email}`);
  console.log(`   Verify URL: ${verifyUrl}`);
}

/**
 * Configure email service for production
 * 
 * Example with SendGrid:
 * 
 * import sgMail from '@sendgrid/mail';
 * sgMail.setApiKey(process.env.SENDGRID_API_KEY);
 * 
 * export async function sendEmail(emailData: any) {
 *   await sgMail.send(emailData);
 * }
 */

