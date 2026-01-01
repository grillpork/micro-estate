import { DemandList } from "@/components/demands";
import { Sparkles } from "lucide-react";

export default function AllDemandsPage() {
  return (
    <div className="container py-10 px-4 md:px-6 space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            ความต้องการทั้งหมด
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          รายการความต้องการซื้อ/เช่าอสังหาริมทรัพย์จากผู้ใช้งานทั้งหมด (สำหรับ
          Agent)
        </p>
      </div>

      <DemandList />
    </div>
  );
}
