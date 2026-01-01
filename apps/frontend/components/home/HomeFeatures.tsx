"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Shield,
  TrendingUp,
  Users,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: <Sparkles className="h-6 w-6" />,
    color: "from-blue-500 to-cyan-500",
    title: "AI Matching",
    description: "ระบบ AI จับคู่ความต้องการของคุณกับอสังหาที่เหมาะสมที่สุด",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    color: "from-purple-500 to-pink-500",
    title: "ตัวแทนยืนยันตัวตน",
    description: "ตัวแทนทุกคนผ่านการยืนยันตัวตนเพื่อความปลอดภัยสูงสุด",
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    color: "from-amber-500 to-orange-500",
    title: "ข้อมูลตลาดเรียลไทม์",
    description: "ติดตามราคาและแนวโน้มตลาดอสังหาริมทรัพย์แบบวินาทีต่อวินาที",
  },
  {
    icon: <Users className="h-6 w-6" />,
    color: "from-green-500 to-emerald-500",
    title: "ชุมชนผู้ซื้อ-ผู้ขาย",
    description: "เชื่อมต่อโดยตรงกับเจ้าของหรือตัวแทนมืออาชีพได้ทันที",
  },
];

export function HomeFeatures() {
  return (
    <section className="py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2 relative">
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <Badge className="bg-primary/10 text-primary mb-6 rounded-full font-black border-none">
                SMART SEARCH
              </Badge>
              <h2 className="text-5xl md:text-6xl font-black leading-[0.9] mb-8">
                MATCHING <span className="text-primary italic">BEYOND</span>
                <br />
                EXPECTATIONS.
              </h2>
              <p className="text-lg text-muted-foreground font-medium mb-10 max-w-lg">
                ระบบอัจฉริยะที่ใช้ Machine Learning
                ในการวิเคราะห์พฤติกรรมและความต้องการของคุณ
                เพื่อจับคู่ทรัพย์สินที่สมบูรณ์แบบที่สุด ไม่ใช่แค่การค้นหา
                แต่เป็นการ 'Match'
              </p>

              <div className="grid gap-4">
                {[
                  "AI-Powered Prediction Engine",
                  "Real-time Agent Verification System",
                  "Predictive Pricing Models",
                  "Personalized Recommendation",
                ].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-transparent hover:border-primary/20 transition-all cursor-default"
                  >
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="font-black text-sm uppercase tracking-wide">
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="lg:w-1/2 grid grid-cols-2 gap-6 relative">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="p-8 rounded-[40px] bg-white dark:bg-zinc-900 border border-border/40 shadow-xl relative overflow-hidden group"
              >
                <div
                  className={cn(
                    "inline-flex p-4 rounded-2xl bg-linear-to-br text-white mb-6 shadow-lg",
                    feature.color
                  )}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black mb-3 leading-tight">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground font-medium">
                  {feature.description}
                </p>

                {/* Decorative background circle */}
                <div
                  className={cn(
                    "absolute -bottom-10 -right-10 w-32 h-32 bg-linear-to-br opacity-5 rounded-full transition-transform group-hover:scale-150",
                    feature.color
                  )}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
