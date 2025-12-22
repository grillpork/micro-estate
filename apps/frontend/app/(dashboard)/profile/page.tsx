"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
    User,
    Mail,
    Phone,
    Camera,
    Save,
    Shield,
    Building2,
} from "lucide-react";
import { toast } from "sonner";

import { Navbar, Footer } from "@/components/layout";
import {
    Button,
    Input,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Avatar,
    AvatarImage,
    AvatarFallback,
    Badge,
    Spinner,
} from "@/components/ui";
import { useSession, api } from "@/services";

// Validation schema
const profileSchema = z.object({
    name: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร"),
    phone: z.string().optional(),
    bio: z.string().max(500, "ประวัติย่อต้องไม่เกิน 500 ตัวอักษร").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { data: session, isPending } = useSession();
    // Cast user with role property
    const user = session?.user as ({ role?: string; phone?: string; bio?: string } & { id: string; name: string; email: string; image?: string | null }) | undefined;

    const [isUpdating, setIsUpdating] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || "",
            phone: user?.phone || "",
            bio: user?.bio || "",
        },
    });

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload
        setIsUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            await api.post("/users/profile-image", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("อัปโหลดรูปโปรไฟล์สำเร็จ");
        } catch {
            toast.error("ไม่สามารถอัปโหลดรูปได้");
            setPreviewImage(null);
        } finally {
            setIsUploadingImage(false);
        }
    };

    const onSubmit = async (data: ProfileFormData) => {
        setIsUpdating(true);
        try {
            await api.patch("/users/profile", data);
            toast.success("อัปเดตโปรไฟล์สำเร็จ");
        } catch {
            toast.error("ไม่สามารถอัปเดตโปรไฟล์ได้");
        } finally {
            setIsUpdating(false);
        }
    };

    const getInitials = (name: string | null | undefined) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (isPending) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const userRole = user.role as string;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-auto max-w-3xl space-y-6"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">โปรไฟล์ของฉัน</h1>
                            <p className="text-muted-foreground">
                                จัดการข้อมูลส่วนตัวของคุณ
                            </p>
                        </div>
                        <Badge
                            variant={
                                userRole === "admin"
                                    ? "destructive"
                                    : userRole === "agent"
                                        ? "success"
                                        : "secondary"
                            }
                        >
                            {userRole === "admin"
                                ? "ผู้ดูแลระบบ"
                                : userRole === "agent"
                                    ? "ตัวแทน"
                                    : "ผู้ใช้"}
                        </Badge>
                    </div>

                    {/* Profile Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>ข้อมูลส่วนตัว</CardTitle>
                            <CardDescription>
                                อัปเดตข้อมูลส่วนตัวและรูปโปรไฟล์ของคุณ
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Profile Image */}
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <Avatar size="xl" className="h-24 w-24">
                                            {previewImage || user.image ? (
                                                <AvatarImage
                                                    src={previewImage || user.image || ""}
                                                    alt={user.name || ""}
                                                />
                                            ) : null}
                                            <AvatarFallback className="text-2xl">
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>

                                        {isUploadingImage && (
                                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                                                <Spinner size="sm" />
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploadingImage}
                                            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow transition-transform hover:scale-110"
                                        >
                                            <Camera className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        className="hidden"
                                    />

                                    <div>
                                        <p className="font-medium">{user.name || "ไม่ระบุชื่อ"}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium">
                                            ชื่อ-นามสกุล
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="name"
                                                placeholder="ชื่อของคุณ"
                                                className="pl-10"
                                                {...register("name")}
                                                disabled={isUpdating}
                                            />
                                        </div>
                                        {errors.name && (
                                            <p className="text-xs text-destructive">
                                                {errors.name.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium">
                                            อีเมล
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                value={user.email}
                                                className="pl-10"
                                                disabled
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            ไม่สามารถแก้ไขอีเมลได้
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="phone" className="text-sm font-medium">
                                            เบอร์โทรศัพท์
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                placeholder="0xx-xxx-xxxx"
                                                className="pl-10"
                                                {...register("phone")}
                                                disabled={isUpdating}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="bio" className="text-sm font-medium">
                                        แนะนำตัว
                                    </label>
                                    <textarea
                                        id="bio"
                                        placeholder="เขียนแนะนำตัวสั้นๆ..."
                                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        {...register("bio")}
                                        disabled={isUpdating}
                                    />
                                    {errors.bio && (
                                        <p className="text-xs text-destructive">
                                            {errors.bio.message}
                                        </p>
                                    )}
                                </div>

                                <Button type="submit" disabled={isUpdating || !isDirty}>
                                    {isUpdating ? (
                                        <>
                                            <Spinner size="sm" className="mr-2" />
                                            กำลังบันทึก...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            บันทึกการเปลี่ยนแปลง
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    {userRole === "user" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>เป็นตัวแทนอสังหา</CardTitle>
                                <CardDescription>
                                    สมัครเป็นตัวแทนเพื่อลงประกาศขายหรือให้เช่าอสังหา
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" asChild>
                                    <a href="/become-agent">
                                        <Building2 className="mr-2 h-4 w-4" />
                                        สมัครเป็นตัวแทน
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Security */}
                    <Card>
                        <CardHeader>
                            <CardTitle>ความปลอดภัย</CardTitle>
                            <CardDescription>
                                จัดการรหัสผ่านและการตั้งค่าความปลอดภัย
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" asChild>
                                <a href="/settings/security">
                                    <Shield className="mr-2 h-4 w-4" />
                                    เปลี่ยนรหัสผ่าน
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
