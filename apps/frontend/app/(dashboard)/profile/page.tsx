"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { User, Calendar, Shield, Star, Bell, ExternalLink } from "lucide-react";
import Link from "next/link";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
} from "@/components/ui";
import {
  ProfileAvatarUpload,
  ProfileEditForm,
  ProfileSecuritySection,
} from "@/components/forms/user";
import { cn } from "@/lib/utils";
import { useSession } from "@/services";

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const user = session?.user as
    | ({ role?: string; phone?: string; bio?: string; createdAt?: string } & {
        id: string;
        name: string;
        email: string;
        image?: string | null;
      })
    | undefined;

  const memberSince = useMemo(() => {
    if (!user?.createdAt) return "ธันวาคม 2023";
    return new Date(user.createdAt).toLocaleDateString("th-TH", {
      month: "long",
      year: "numeric",
    });
  }, [user?.createdAt]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background/50">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <User className="h-4 w-4 text-primary animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const userRole = user.role as string;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black">
      <main className="pb-20">
        {/* Modern Banner & Avatar Section */}
        <div className="relative h-48 md:h-64 bg-linear-to-r from-primary/20 via-primary/10 to-transparent overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="container mx-auto px-4 h-full relative">
            <div className="absolute -bottom-16 left-6 md:left-12 flex items-end gap-6">
              <ProfileAvatarUpload
                currentImage={user.image}
                userName={user.name}
              />

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-4 pb-2"
              >
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
                  {user.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    className={cn(
                      "px-3 py-1 rounded-full font-bold",
                      userRole === "admin"
                        ? "bg-destructive text-white"
                        : userRole === "agent"
                          ? "bg-green-500 text-white"
                          : "bg-primary text-white"
                    )}
                  >
                    {userRole === "admin"
                      ? "ผู้ดูแลระบบ"
                      : userRole === "agent"
                        ? "ตัวแทนอสังหา"
                        : "สมาชิกทั่วไป"}
                  </Badge>
                  <span className="flex items-center text-sm text-muted-foreground font-medium">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    เป็นสมาชิกตั้งแต่ {memberSince}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-24 md:mt-28">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Sidebar Info */}
            <div className="lg:col-span-4 space-y-6">
              <motion.div variants={itemVariants}>
                <Card className="border-none shadow-sm overflow-hidden rounded-2xl md:rounded-3xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold">
                      ความคืบหน้าโปรไฟล์
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "85%" }}
                        className="h-full bg-primary"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                      ข้อมูลของคุณมีความครบถ้วน{" "}
                      <span className="text-primary font-bold">85%</span>{" "}
                      กรุณาเพิ่มที่อยู่เพื่อให้การยืนยันตัวตนรวดเร็วขึ้น
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="p-3 bg-muted/40 rounded-xl text-center">
                        <span className="block text-xl font-bold">12</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                          ประกาศ
                        </span>
                      </div>
                      <div className="p-3 bg-muted/40 rounded-xl text-center">
                        <span className="block text-xl font-bold">4.8</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                          คะแนน
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-2">
                    ทางลัด
                  </h3>
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-border/50 hover:border-primary/50 transition-all hover:shadow-md group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Star className="h-5 w-5" />
                      </div>
                      <span className="font-bold">รายการโปรด</span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </Link>
                  <Link
                    href="/settings/notifications"
                    className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-border/50 hover:border-primary/50 transition-all hover:shadow-md group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Bell className="h-5 w-5" />
                      </div>
                      <span className="font-bold">การแจ้งเตือน</span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </div>
              </motion.div>

              {userRole === "user" && (
                <motion.div variants={itemVariants}>
                  <Card className="border-primary/20 bg-primary/5 overflow-hidden rounded-3xl relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Shield className="h-16 w-16" />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        ยืนยันตัวตนตัวแทน
                      </CardTitle>
                      <CardDescription>
                        ปลดล็อกฟีเจอร์การลงประกาศไม่จำกัด
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full rounded-xl font-bold" asChild>
                        <Link href="/become-agent">สมัครเป็นตัวแทนอสังหา</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Profile Edit Form */}
            <div className="lg:col-span-8">
              <motion.div variants={itemVariants}>
                <ProfileEditForm
                  defaultValues={{
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    bio: user.bio,
                  }}
                />
              </motion.div>

              <motion.div variants={itemVariants} className="mt-8">
                <ProfileSecuritySection />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
