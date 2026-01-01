"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RefreshCw,
  Home,
  BedDouble,
  Bath,
  Maximize,
  ArrowRight,
  Sparkles,
  Clock,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  Button,
  Badge,
  ScrollArea,
} from "@/components/ui";
import {
  demandsService,
  type Demand,
  type DemandMatchResult,
} from "@/services";
import { cn } from "@/lib/utils";

export default function MatchDemandPage() {
  const queryClient = useQueryClient();
  const [selectedDemandId, setSelectedDemandId] = useState<string | null>(null);

  // 1. Fetch User Demands
  const { data: demands, isLoading: isLoadingDemands } = useQuery({
    queryKey: ["my-demands"],
    queryFn: demandsService.getMine,
  });

  // Set initial selected demand
  useEffect(() => {
    if (demands && demands.length > 0 && !selectedDemandId) {
      // Prefer active demands first
      const firstActive = demands.find((d) => d.status === "active");
      setSelectedDemandId(firstActive?.id || demands[0].id);
    }
  }, [demands, selectedDemandId]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AI Demand Matching
          </h1>
          <p className="text-muted-foreground mt-1">
            ระบบจับคู่ความต้องการของคุณกับอสังหาฯ ที่เหมาะสมด้วย AI
          </p>
        </div>
      </div>

      {isLoadingDemands ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !demands || demands.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar: Demand Selector */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-muted/30 border-none shadow-none">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg">ความต้องการของคุณ</CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-2">
                <ScrollArea className="h-[400px] lg:h-[calc(100vh-300px)] pr-3">
                  <div className="space-y-2">
                    {demands.map((demand) => (
                      <DemandCard
                        key={demand.id}
                        demand={demand}
                        isSelected={selectedDemandId === demand.id}
                        onClick={() => setSelectedDemandId(demand.id)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Content: Matches */}
          <div className="lg:col-span-3">
            {selectedDemandId ? (
              <MatchesView demandId={selectedDemandId} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center text-muted-foreground bg-muted/10 rounded-3xl border-2 border-dashed border-muted">
                <Search className="h-12 w-12 mb-4 opacity-20" />
                <p>เลือกความต้องการเพื่อดูผลลัพธ์การจับคู่</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component: Demand Selector Card
function DemandCard({
  demand,
  isSelected,
  onClick,
}: {
  demand: Demand;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-xl border transition-all duration-200 group relative overflow-hidden",
        isSelected
          ? "bg-background border-primary shadow-md ring-1 ring-primary/20"
          : "bg-background border-border hover:border-primary/50 hover:bg-accent/50"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <Badge
          variant={demand.intent === "buy" ? "default" : "secondary"}
          className="text-[10px] px-2 py-0.5 h-5 capitalize"
        >
          {demand.intent === "buy" ? "ซื้อ" : "เช่า"}
        </Badge>
        <span
          className={cn(
            "text-[10px] font-medium px-2 py-0.5 rounded-full",
            demand.status === "active"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-muted text-muted-foreground"
          )}
        >
          {demand.status === "active" ? "กำลังหา" : "ปิดแล้ว"}
        </span>
      </div>

      <h3 className="font-semibold text-sm truncate mb-1">
        {demand.propertyType} @{" "}
        {demand.subDistrict || demand.district || demand.province}
      </h3>

      <div className="flex items-center text-xs text-muted-foreground gap-2">
        <span className="truncate max-w-[80px]">
          {demand.budgetMin && demand.budgetMax
            ? `${(Number(demand.budgetMin) / 1000000).toFixed(1)}-${(
                Number(demand.budgetMax) / 1000000
              ).toFixed(1)}M`
            : "ไม่ระบุงบ"}
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {new Date(demand.createdAt).toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>

      {isSelected && (
        <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
      )}
    </button>
  );
}

// Sub-component: Matches View
function MatchesView({ demandId }: { demandId: string }) {
  const queryClient = useQueryClient();

  // Fetch Matches
  const {
    data: matchData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["matches", demandId],
    queryFn: () => demandsService.getMatches(demandId),
    enabled: !!demandId,
  });

  // Mutation: Refresh Matches
  const refreshMutation = useMutation({
    mutationFn: () => demandsService.refreshMatches(demandId),
    onSuccess: (data) => {
      toast.success(`พบอสังหาฯ ที่ตรงกัน ${data.matchCount} รายการใหม่`);
      queryClient.invalidateQueries({ queryKey: ["matches", demandId] });
    },
    onError: () => {
      toast.error("เกิดข้อผิดพลาดในการค้นหาใหม่");
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <RefreshCw className="relative h-12 w-12 animate-spin text-primary" />
        </div>
        <p className="text-muted-foreground animate-pulse">
          AI กำลังวิเคราะห์ความต้องการของคุณ...
        </p>
      </div>
    );
  }

  const matches = matchData?.matches || [];
  const recommendations = matchData?.recommendations || [];

  return (
    <div className="space-y-8">
      {/* Action Bar */}
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold">
            ผลลัพธ์การจับคู่ ({matches.length})
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending || isRefetching}
        >
          <RefreshCw
            className={cn(
              "mr-2 h-4 w-4",
              (refreshMutation.isPending || isRefetching) && "animate-spin"
            )}
          />
          ค้นหาใหม่
        </Button>
      </div>

      {/* Match List (Exact Matches) */}
      {matches.length === 0 && recommendations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[300px] bg-muted/10 rounded-3xl border-2 border-dashed border-muted text-center p-8">
          <div className="bg-muted rounded-full p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            ยังไม่พบรายการที่ตรงกัน
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            ระบบยังไม่พบอสังหาฯ ที่ตรงกับเกณฑ์ของคุณในขณะนี้ ลองกดปุ่ม
            "ค้นหาใหม่" หรือปรับเปลี่ยนเงื่อนไขความต้องการของคุณ
          </p>
          <Button onClick={() => refreshMutation.mutate()}>ค้นหาใหม่เลย</Button>
        </div>
      ) : (
        <div className="space-y-8">
          {matches.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {matches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    layout
                  >
                    <MatchCard match={match} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Recommendations Section */}
          {recommendations.length > 0 && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  ทรัพย์แนะนำเพิ่มเติม (ใกล้เคียง)
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {recommendations.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    layout
                  >
                    <MatchCard match={match} isRecommendation />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Sub-component: Individual Match Card
function MatchCard({
  match,
  isRecommendation,
}: {
  match: DemandMatchResult;
  isRecommendation?: boolean;
}) {
  const property = match.property;

  return (
    <Card className="group overflow-hidden border-border/60 hover:border-primary/50 hover:shadow-lg transition-all duration-300 bg-background/50 backdrop-blur-sm">
      {/* Match Score Badge */}
      <div className="absolute top-3 left-3 z-10">
        <div className="flex items-center gap-1.5 bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-primary/20 shadow-sm">
          <div
            className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              isRecommendation
                ? "bg-blue-500"
                : match.score > 85
                  ? "bg-emerald-500"
                  : match.score > 70
                    ? "bg-amber-500"
                    : "bg-red-500"
            )}
          />
          <span className="text-xs font-bold text-foreground">
            {isRecommendation ? "แนะนำ" : `${match.score}% ตรงใจ`}
          </span>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        {property.images?.[0]?.url ? (
          <img
            src={property.images[0].url}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Home className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-black/0 opacity-60" />

        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end text-white">
          <div className="font-bold text-lg">
            ฿{(Number(property.price) / 1000000).toFixed(2)}M
          </div>
          <div className="text-xs font-medium bg-black/40 px-2 py-1 rounded-md backdrop-blur-md border border-white/10">
            {property.subDistrict || property.district}
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
          {property.title}
        </h3>

        {/* Specs */}
        <div className="flex items-center justify-between text-xs text-muted-foreground py-2 border-y border-border/50">
          <div className="flex items-center gap-1">
            <BedDouble className="h-3.5 w-3.5" />
            <span>{property.bedrooms} นอน</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-3.5 w-3.5" />
            <span>{property.bathrooms} น้ำ</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="h-3.5 w-3.5" />
            <span>{property.area} ตร.ม.</span>
          </div>
        </div>

        {/* AI Explanation */}
        <div className="bg-primary/5 rounded-lg p-3 text-xs leading-relaxed text-muted-foreground border border-primary/10">
          <div className="flex items-center gap-1.5 mb-1 text-primary font-medium">
            <Sparkles className="h-3 w-3" />
            <span>AI Analysis</span>
          </div>
          <p className="line-clamp-2">{match.explanation}</p>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Link href={`/properties/${property.id}`} className="flex-1">
          <Button className="w-full" size="sm">
            ดูรายละเอียด
            <ArrowRight className="ml-2 h-3 w-3" />
          </Button>
        </Link>
        <Button variant="outline" size="sm" className="px-3">
          <Heart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 max-w-md mx-auto">
      <div className="bg-primary/10 rounded-full p-6">
        <Sparkles className="h-12 w-12 text-primary" />
      </div>
      <div>
        <h2 className="text-2xl font-bold">เริ่มค้นหาบ้านในฝัน</h2>
        <p className="text-muted-foreground mt-2">
          คุณยังไม่มีรายการความต้องการ (Demand)
          สร้างโพสต์ความต้องการของคุณเพื่อให้ AI ช่วยค้นหาอสังหาฯ ที่ตรงใจที่สุด
        </p>
      </div>
      <Link href="/post-demand">
        <Button size="lg" className="rounded-full px-8">
          สร้างความต้องการใหม่
        </Button>
      </Link>
    </div>
  );
}
