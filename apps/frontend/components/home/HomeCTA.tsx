"use client";

import { motion } from "framer-motion";
import { Search, Building2 } from "lucide-react";
import { Button } from "@/components/ui";

export function HomeCTA() {
  return (
    <section className="py-24 px-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="container mx-auto max-w-6xl relative rounded-[60px] overflow-hidden bg-zinc-900 text-white min-h-[500px] flex items-center justify-center text-center p-12"
      >
        {/* Animated Background for CTA */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,var(--primary-rgb),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(59,130,246,1),transparent_40%)]" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <h2 className="text-5xl md:text-7xl font-black leading-[0.9] mb-8 uppercase tracking-tighter">
            Ready to find your <br />
            <span className="text-primary italic">NEXT CHAPTER?</span>
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl font-medium mb-12 max-w-xl mx-auto leading-relaxed">
            ก้าวเข้าสู่โลกของอสังหาริมทรัพย์ที่ง่ายขึ้นด้วย Micro Estate
            ไม่ว่าคุณจะซื้อ ขาย หรือเช่า เราคือพาร์ทเนอร์ที่ดีที่สุดของคุณ
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button
              size="lg"
              className="h-16 px-12 rounded-full font-black text-lg bg-primary hover:bg-primary-hover shadow-2xl shadow-primary/20 transition-all active:scale-95 group"
            >
              <Search className="mr-3 h-5 w-5" />
              สำรวจประกาศทั้งหมด
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-16 px-12 rounded-full font-black text-lg bg-transparent border-white/20 hover:bg-white hover:text-black transition-all group"
            >
              <Building2 className="mr-3 h-5 w-5" />
              เข้าร่วมเป็นตัวแทน
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
