"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  Search,
  Compass,
  Zap,
  LayoutGrid,
  Users,
  Shield,
  Star,
  Sparkles,
} from "lucide-react";
import { Button, Input, Badge } from "@/components/ui";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { HomeStats } from "@/services";

export function HomeHero({ stats }: { stats: HomeStats | null }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 300]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedType) params.set("type", selectedType);
    router.push(`/properties?${params.toString()}`);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K+`;
    return num.toString();
  };

  return (
    <section
      className="relative min-h-[90vh] flex items-center justify-center pt-20"
      ref={containerRef}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.08)_0,transparent_70%)] blur-3xl" />

        <motion.div
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -30, 30, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -40, 40, 0],
            y: [0, 60, -60, 0],
            scale: [1, 0.8, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge className="mb-6 px-4 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-all cursor-default text-xs font-bold uppercase tracking-widest">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            Revolutionizing Real Estate with AI
          </Badge>

          <h1 className="text-5xl md:text-7xl lg:text-[88px] font-black tracking-tighter leading-[0.9] mb-8">
            FIND YOUR <span className="text-primary italic">DREAM</span>
            <br />
            ESTATE{" "}
            <span
              className="text-outline-primary text-transparent"
              style={{ WebkitTextStroke: "2px var(--primary)" }}
            >
              SMARTER.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground/80 font-medium mb-12">
            สัมผัสประสบการณ์การค้นหาอสังหาฯ รูปแบบใหม่ที่ขับเคลื่อนด้วย AI
            แม่นยำ รวดเร็ว และตอบโจทย์ไลฟ์สไตล์ของคุณที่สุด
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mx-auto max-w-4xl relative"
          >
            <form
              onSubmit={handleSearch}
              className="flex flex-col md:flex-row gap-2 p-2 rounded-[24px] md:rounded-full bg-white dark:bg-zinc-900 shadow-2xl shadow-primary/10 border border-border/40 backdrop-blur-xl"
            >
              <div className="flex-2 relative flex items-center">
                <div className="absolute left-4 p-2 rounded-full bg-muted/50">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ตำแหน่ง, โครงการ, หรือสิ่งที่คุณต้องการ..."
                  className="h-14 md:h-16 border-none pl-16 shadow-none focus-visible:ring-0 text-base font-medium rounded-full bg-transparent"
                />
              </div>

              <div className="flex-1 border-l border-border/40 hidden md:flex items-center px-4">
                <Compass className="h-5 w-5 text-muted-foreground mr-3" />
                <select
                  value={selectedType || ""}
                  onChange={(e) => setSelectedType(e.target.value || null)}
                  className="w-full bg-transparent border-none text-sm font-bold focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="">ทุกประเภท</option>
                  <option value="condo">คอนโด</option>
                  <option value="house">บ้านเดี่ยว</option>
                  <option value="townhouse">ทาวน์เฮาส์</option>
                  <option value="land">ที่ดิน</option>
                </select>
              </div>

              <Button
                type="submit"
                className="h-14 md:h-16 px-8 md:px-12 rounded-full font-black text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all"
              >
                เริ่มค้นหา
              </Button>
            </form>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-12 -right-8 hidden lg:block"
            >
              <div className="bg-white dark:bg-zinc-800 p-3 rounded-2xl shadow-xl border border-border/50 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <Zap className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold">1.2s Fast Matching</span>
              </div>
            </motion.div>
          </motion.div>

          <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto px-4">
            {[
              {
                label: "อสังหาฯ ทั้งหมด",
                value: stats?.totalProperties || 0,
                icon: <LayoutGrid className="h-4 w-4" />,
              },
              {
                label: "ผู้ใช้งานระบบ",
                value: stats?.totalUsers || 0,
                icon: <Users className="h-4 w-4" />,
              },
              {
                label: "ตัวแทนยืนยันตัวตน",
                value: stats?.verifiedAgents || 0,
                icon: <Shield className="h-4 w-4" />,
              },
              {
                label: "คะแนนความพึงพอใจ",
                value: "4.9/5",
                icon: <Star className="h-4 w-4" />,
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="group"
              >
                <p className="text-3xl md:text-4xl font-black text-primary mb-1">
                  {typeof stat.value === "number"
                    ? formatNumber(stat.value)
                    : stat.value}
                </p>
                <div className="flex items-center justify-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                  {stat.icon}
                  <span className="text-xs md:text-sm font-bold uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
