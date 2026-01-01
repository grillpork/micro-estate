import { AuthLayout } from "@/components/layout";
import { SignUpForm } from "@/components/forms/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <AuthLayout
      title="สมัครสมาชิก"
      description="สร้างบัญชีใหม่เพื่อเริ่มค้นหาอสังหาในฝัน"
    >
      <SignUpForm />
    </AuthLayout>
  );
}
