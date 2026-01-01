"use client";

import { useQuery } from "@tanstack/react-query";
import { demandsService, Demand } from "@/services/demands/demands.service";
import { DemandCard } from "./DemandCard";
import { queryKeys } from "@/lib/query-keys";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DemandListProps {
  limit?: number;
  className?: string; // Allow custom classNames
}

export function DemandList({ limit = 10, className }: DemandListProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.demands.public({ limit }),
    queryFn: () => demandsService.getAll({ limit, page: 1 }),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="bg-red-50 p-4 rounded-full">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-muted-foreground max-w-sm">
          เกิดข้อผิดพลาดในการโหลดข้อมูลความต้องการ
          อาจเป็นเพราะเซิร์ฟเวอร์มีปัญหา หรือคุณไม่มีสิทธิ์เข้าถึง (สำหรับ Agent
          เท่านั้น)
        </p>
        <Button onClick={() => refetch()} variant="outline">
          ลองใหม่อีกครั้ง
        </Button>
      </div>
    );
  }

  const demands = data?.data || [];

  if (demands.length === 0) {
    return (
      <div className="text-center py-16 bg-muted/20 rounded-2xl border-2 border-dashed">
        <p className="text-muted-foreground">
          ยังไม่มีประกาศความต้องการในขณะนี้
        </p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className || ""}`}
    >
      {demands.map((demand: Demand) => (
        <DemandCard key={demand.id} demand={demand} />
      ))}
    </div>
  );
}
