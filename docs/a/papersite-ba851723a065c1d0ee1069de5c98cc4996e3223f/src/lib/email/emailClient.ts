// Edge-compatible email interface
export interface EmailConfig {
  from?: string;
  to: string;
  subject: string;
  html: string;
}

export interface EmailResponse {
  success: boolean;
  error?: string;
}

// Simple email templates
export const emailTemplates = {
  verification: (verifyUrl: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verify Your Email Address</h2>
      <p>Thank you for registering! Please click the button below to verify your email address:</p>
      <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 16px 0;">
        Verify Email
      </a>
      <p>Or copy and paste this link in your browser:</p>
      <p style="color: #666;">${verifyUrl}</p>
      <p>This link will expire in 24 hours.</p>
    </div>
  `,

  passwordReset: (resetUrl: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>You requested to reset your password. Click the button below to create a new password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 16px 0;">
        Reset Password
      </a>
      <p>Or copy and paste this link in your browser:</p>
      <p style="color: #666;">${resetUrl}</p>
      <p>This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
    </div>
  `
};

// Simple logging for development when email service is not configured
export async function logEmailForDev(config: EmailConfig): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    // console.log('\n=== Development Email ===');
    // console.log('To:', config.to);
    // console.log('Subject:', config.subject);
    // console.log('Content:', config.html);
    // console.log('========================\n');
  }
}

// Email client for Edge runtime
export class EdgeEmailClient {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.EMAIL_API_KEY || '';
    this.apiUrl = process.env.EMAIL_API_URL || '';
  }

  async sendEmail(config: EmailConfig): Promise<EmailResponse> {
    // If email service is not configured, just log the email
    if (!this.apiKey || !this.apiUrl || process.env.NODE_ENV !== 'production') {
      await logEmailForDev(config);
      return { success: true };
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          from: config.from || process.env.EMAIL_FROM,
          to: config.to,
          subject: config.subject,
          html: config.html
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      return { success: true };
    } catch (error) {
      console.error('Email send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email'
      };
    }
  }

  async sendVerificationEmail(to: string, token: string): Promise<EmailResponse> {
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;
    return this.sendEmail({
      to,
      subject: 'Verify Your Email',
      html: emailTemplates.verification(verifyUrl)
    });
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<EmailResponse> {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
    return this.sendEmail({
      to,
      subject: 'Reset Your Password',
      html: emailTemplates.passwordReset(resetUrl)
    });
  }
}

// Export singleton instance
export const emailClient = new EdgeEmailClient();