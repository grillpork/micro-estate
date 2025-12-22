import { Resend } from "resend";
import { env } from "../../../config/env";
import {
  verificationEmailTemplate,
  approvedEmailTemplate,
  rejectedEmailTemplate,
  passwordResetEmailTemplate,
} from "./templates";

// Create Resend client if API key is configured
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email using Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  if (!resend) {
    console.warn("📧 Email not sent (Resend not configured):", options.subject);
    console.log("To:", options.to);
    return false;
  }

  console.log("📧 Attempting to send email:");
  console.log("  From:", env.EMAIL_FROM);
  console.log("  To:", options.to);
  console.log("  Subject:", options.subject);

  try {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error("❌ Email send error:", JSON.stringify(error, null, 2));
      return false;
    }

    console.log("✅ Email sent successfully:", data?.id);
    return true;
  } catch (error) {
    console.error("❌ Email send exception:", error);
    return false;
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationUrl: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "Verify Your Email - Micro Estate",
    html: verificationEmailTemplate({ name, verificationUrl }),
  });
}

/**
 * Send verification approved email
 */
export async function sendVerificationApprovedEmail(
  email: string,
  name: string,
  level: "basic" | "identity"
): Promise<boolean> {
  const levelText =
    level === "basic" ? "Basic Verification" : "Identity Verification";

  return sendEmail({
    to: email,
    subject: `🎉 ${levelText} Approved - Micro Estate`,
    html: approvedEmailTemplate({ name, level }),
  });
}

/**
 * Send verification rejected email
 */
export async function sendVerificationRejectedEmail(
  email: string,
  name: string,
  reason: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "Verification Update - Micro Estate",
    html: rejectedEmailTemplate({ name, reason }),
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "🔐 Reset Your Password - Micro Estate",
    html: passwordResetEmailTemplate({ name, resetUrl, expiresInMinutes: 60 }),
  });
}
