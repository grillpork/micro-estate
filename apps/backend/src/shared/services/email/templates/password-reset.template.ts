import { baseTemplate } from "./base.template";

interface PasswordResetTemplateOptions {
  name: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

/**
 * Password reset email template
 */
export function passwordResetEmailTemplate({
  name,
  resetUrl,
  expiresInMinutes = 60,
}: PasswordResetTemplateOptions): string {
  const content = `
    <h1 style="margin: 0 0 20px 0; font-size: 24px; color: #1e293b;">
      Reset Your Password
    </h1>
    
    <p style="margin: 0 0 15px 0; color: #475569;">
      Hi <strong>${name}</strong>,
    </p>
    
    <p style="margin: 0 0 15px 0; color: #475569;">
      We received a request to reset your password for your Micro Estate account. 
      Click the button below to set a new password:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" class="button" style="background: #dc2626;">
        🔐 Reset Password
      </a>
    </div>
    
    <div class="info-box" style="background: #fef3c7; border: 1px solid #f59e0b;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        ⚠️ <strong>Important:</strong> This link will expire in <strong>${expiresInMinutes} minutes</strong>. 
        If you didn't request a password reset, you can safely ignore this email.
      </p>
    </div>
    
    <p class="text-muted" style="margin: 20px 0 0 0;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="word-break: break-all; font-size: 12px; color: #64748b; margin: 10px 0;">
      ${resetUrl}
    </p>
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
    
    <p class="text-muted" style="margin: 0;">
      If you didn't request this password reset, please ignore this email or contact support 
      if you believe your account has been compromised.
    </p>
  `;

  return baseTemplate({
    content,
    backgroundColor: "#fff7ed",
    borderColor: "#fed7aa",
  });
}
