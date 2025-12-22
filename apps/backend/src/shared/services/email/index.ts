export {
  sendEmail,
  sendVerificationEmail,
  sendVerificationApprovedEmail,
  sendVerificationRejectedEmail,
  sendPasswordResetEmail,
} from "./email.service";

// Re-export templates for extensibility
export * from "./templates";
