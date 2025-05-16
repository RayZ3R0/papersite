'use server';

import nodemailer from 'nodemailer';
import { EmailConfig, EmailResponse, emailTemplates } from '@/lib/email/emailClient';

// Initialize nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Server action to send emails using nodemailer
 */
export async function sendEmail(config: EmailConfig): Promise<EmailResponse> {
  // If SMTP is not configured, log email in development
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n=== Development Email ===');
      console.log('To:', config.to);
      console.log('Subject:', config.subject);
      console.log('Content:', config.html);
      console.log('========================\n');
      return { success: true };
    }
    return {
      success: false,
      error: 'Email service not configured'
    };
  }

  try {
    await transporter.sendMail({
      from: config.from || process.env.SMTP_USER,
      to: config.to,
      subject: config.subject,
      html: config.html,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email'
    };
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(to: string, token: string): Promise<EmailResponse> {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;
  return sendEmail({
    to,
    subject: 'Verify Your Email',
    html: emailTemplates.verification(verifyUrl)
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(to: string, token: string): Promise<EmailResponse> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
  return sendEmail({
    to,
    subject: 'Reset Your Password',
    html: emailTemplates.passwordReset(resetUrl)
  });
}