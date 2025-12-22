import { baseTemplate } from "./base.template";

interface RejectedEmailOptions {
  name: string;
  reason: string;
}

export function rejectedEmailTemplate({
  name,
  reason,
}: RejectedEmailOptions): string {
  const content = `
    <h2>สวัสดี ${name}</h2>
    <p>เราขอแจ้งให้ทราบว่าการยืนยันตัวตนของคุณไม่ผ่านการตรวจสอบ</p>
    <div class="info-box">
      <h3>เหตุผล:</h3>
      <p>${reason}</p>
    </div>
    <p>คุณสามารถส่งเอกสารใหม่เพื่อยืนยันตัวตนอีกครั้งได้</p>
  `;

  return baseTemplate({
    content,
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  });
}
