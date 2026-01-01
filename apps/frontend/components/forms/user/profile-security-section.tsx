import Link from "next/link";
import { Shield } from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";

export function ProfileSecuritySection() {
  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-zinc-950">
      <CardHeader>
        <CardTitle className="text-lg font-black flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          ความปลอดภัยและการจัดการบัญชี
        </CardTitle>
      </CardHeader>
      <CardContent className="grid sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-muted/40 border border-transparent hover:border-primary/20 transition-all">
          <h4 className="font-bold text-sm mb-1">รหัสผ่าน</h4>
          <p className="text-xs text-muted-foreground mb-4">
            แนะนำให้เปลี่ยนรหัสผ่านทุกๆ 6 เดือนเพื่อความปลอดภัย
          </p>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg font-bold w-full"
            asChild
          >
            <Link href="/settings/security">เปลี่ยนรหัสผ่าน</Link>
          </Button>
        </div>
        <div className="p-4 rounded-2xl bg-muted/40 border border-transparent hover:border-red-200 transition-all">
          <h4 className="font-bold text-sm mb-1 text-destructive">ปิดบัญชี</h4>
          <p className="text-xs text-muted-foreground mb-4">
            ข้อมูลและประกาศทั้งหมดของคุณจะถูกลบถาวร
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg font-bold w-full text-destructive hover:bg-destructive/10"
          >
            ขอลบข้อมูลบัญชี
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
