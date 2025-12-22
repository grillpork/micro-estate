import { baseTemplate } from "./base.template";

interface VerificationEmailOptions {
  name: string;
  verificationUrl: string;
}

export function verificationEmailTemplate({
  name,
  verificationUrl,
}: VerificationEmailOptions): string {
  const content = `
    <h2>สวัสดี ${name}!</h2>
    <p>ขอบคุณที่สมัครเป็นนายหน้ากับเรา กรุณายืนยันอีเมลของคุณโดยคลิกปุ่มด้านล่าง:</p>
    <div style="text-align: center;">
      <a href="${verificationUrl}" class="button">ยืนยันอีเมล</a>
    </div>
    <p class="text-muted">
      ลิงก์นี้จะหมดอายุใน 24 ชั่วโมง หากคุณไม่ได้สมัครใช้งาน กรุณาเพิกเฉยอีเมลนี้
    </p>
  `;

  return baseTemplate({ content });
}
