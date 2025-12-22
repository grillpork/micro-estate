import { baseTemplate } from "./base.template";

interface ApprovedEmailOptions {
  name: string;
  level: "basic" | "identity";
}

export function approvedEmailTemplate({
  name,
  level,
}: ApprovedEmailOptions): string {
  const isIdentityLevel = level === "identity";

  const badgeStyle = `
    display: inline-block;
    background: ${isIdentityLevel ? "#2563eb" : "#64748b"};
    color: white;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
  `;

  const benefits = isIdentityLevel
    ? `
      <li>ลงประกาศได้ไม่จำกัด</li>
      <li>แสดง Badge "Verified"</li>
      <li>แสดงก่อนในผลค้นหา</li>
    `
    : `<li>ลงประกาศได้ 1 รายการ</li>`;

  const badgeText = isIdentityLevel ? "✓ Verified" : "Basic Verified";

  const content = `
    <h2>🎉 ยินดีด้วย ${name}!</h2>
    <p>บัญชีของคุณได้รับการยืนยันเรียบร้อยแล้ว</p>
    <p><span style="${badgeStyle}">${badgeText}</span></p>
    <div class="info-box">
      <h3>สิทธิประโยชน์:</h3>
      <ul>${benefits}</ul>
    </div>
  `;

  return baseTemplate({
    content,
    backgroundColor: "#f0fdf4",
    borderColor: "#86efac",
  });
}
