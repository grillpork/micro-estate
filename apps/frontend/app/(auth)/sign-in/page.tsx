import { AuthLayout } from "@/components/layout";
import { SignInForm } from "@/components/forms/auth/sign-in-form";

export default function SignInPage() {
  return (
    <AuthLayout
      title="เข้าสู่ระบบ"
      description="ยินดีต้อนรับกลับ! กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ"
    >
      <SignInForm />
    </AuthLayout>
  );
}
