"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
    Upload,
    Camera,
    IdCard,
    User,
    FileCheck,
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle,
    ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

import { Navbar, Footer } from "@/components/layout";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Badge,
    Spinner,
} from "@/components/ui";
import { useSession, api } from "@/services";
import Link from "next/link";

// Validation schema
const verificationSchema = z.object({
    idCardImage: z.instanceof(File, { message: "กรุณาอัปโหลดรูปบัตรประชาชน" }),
    selfieImage: z.instanceof(File, { message: "กรุณาอัปโหลดรูป Selfie" }),
    licenseImage: z.instanceof(File).optional(),
});

type VerificationFormData = z.infer<typeof verificationSchema>;

type VerificationStatus = "pending" | "processing" | "verified" | "rejected" | "none";

const statusConfig: Record<VerificationStatus, { icon: React.ReactNode; label: string; color: string }> = {
    none: { icon: <IdCard className="h-5 w-5" />, label: "ยังไม่ได้สมัคร", color: "secondary" },
    pending: { icon: <Clock className="h-5 w-5" />, label: "รอการตรวจสอบ", color: "warning" },
    processing: { icon: <Clock className="h-5 w-5" />, label: "กำลังตรวจสอบ", color: "info" },
    verified: { icon: <CheckCircle className="h-5 w-5" />, label: "ได้รับการยืนยันแล้ว", color: "success" },
    rejected: { icon: <XCircle className="h-5 w-5" />, label: "ถูกปฏิเสธ", color: "destructive" },
};

export default function BecomeAgentPage() {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<VerificationStatus>("none");
    const [rejectionReason, setRejectionReason] = useState<string | null>(null);

    // Image previews
    const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
    const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
    const [licensePreview, setLicensePreview] = useState<string | null>(null);

    // Refs
    const idCardRef = useRef<HTMLInputElement>(null);
    const selfieRef = useRef<HTMLInputElement>(null);
    const licenseRef = useRef<HTMLInputElement>(null);

    const {
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<VerificationFormData>({
        resolver: zodResolver(verificationSchema),
    });

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: keyof VerificationFormData,
        setPreview: (url: string | null) => void
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("ไฟล์ใหญ่เกินไป (สูงสุด 5MB)");
            return;
        }

        setValue(field, file);

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const onSubmit = async (data: VerificationFormData) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("idCardImage", data.idCardImage);
            formData.append("selfieImage", data.selfieImage);
            if (data.licenseImage) {
                formData.append("licenseImage", data.licenseImage);
            }

            await api.post("/verification/agent", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("ส่งคำขอสำเร็จ! กรุณารอการตรวจสอบ");
            setCurrentStatus("pending");
        } catch (error) {
            toast.error("ไม่สามารถส่งคำขอได้ กรุณาลองอีกครั้ง");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isPending) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    const status = statusConfig[currentStatus];

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-auto max-w-2xl space-y-6"
                >
                    {/* Back Button */}
                    <Link href="/profile" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        กลับไปโปรไฟล์
                    </Link>

                    {/* Header */}
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">สมัครเป็นตัวแทน</h1>
                        <p className="mt-2 text-muted-foreground">
                            ยืนยันตัวตนเพื่อเริ่มลงประกาศขายหรือให้เช่าอสังหาริมทรัพย์
                        </p>
                    </div>

                    {/* Status Card */}
                    {currentStatus !== "none" && (
                        <Card>
                            <CardContent className="flex items-center gap-4 py-4">
                                <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-full bg-${status.color}/10`}
                                >
                                    {status.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{status.label}</p>
                                    {currentStatus === "rejected" && rejectionReason && (
                                        <p className="text-sm text-destructive">{rejectionReason}</p>
                                    )}
                                    {currentStatus === "pending" && (
                                        <p className="text-sm text-muted-foreground">
                                            เราจะตรวจสอบภายใน 1-3 วันทำการ
                                        </p>
                                    )}
                                </div>
                                <Badge variant={status.color as "default"}>{status.label}</Badge>
                            </CardContent>
                        </Card>
                    )}

                    {/* Verification Form */}
                    {(currentStatus === "none" || currentStatus === "rejected") && (
                        <Card>
                            <CardHeader>
                                <CardTitle>อัปโหลดเอกสาร</CardTitle>
                                <CardDescription>
                                    กรุณาอัปโหลดเอกสารต่อไปนี้เพื่อยืนยันตัวตน
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    {/* ID Card */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            รูปบัตรประชาชน <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            ref={idCardRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, "idCardImage", setIdCardPreview)}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => idCardRef.current?.click()}
                                            className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary hover:bg-accent"
                                        >
                                            {idCardPreview ? (
                                                <img
                                                    src={idCardPreview}
                                                    alt="ID Card"
                                                    className="max-h-40 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <>
                                                    <IdCard className="h-8 w-8 text-muted-foreground" />
                                                    <span className="text-muted-foreground">
                                                        คลิกเพื่ออัปโหลดรูปบัตรประชาชน
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                        {errors.idCardImage && (
                                            <p className="text-xs text-destructive">
                                                {errors.idCardImage.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Selfie */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            รูป Selfie คู่กับบัตรประชาชน <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            ref={selfieRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, "selfieImage", setSelfiePreview)}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => selfieRef.current?.click()}
                                            className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary hover:bg-accent"
                                        >
                                            {selfiePreview ? (
                                                <img
                                                    src={selfiePreview}
                                                    alt="Selfie"
                                                    className="max-h-40 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <>
                                                    <Camera className="h-8 w-8 text-muted-foreground" />
                                                    <span className="text-muted-foreground">
                                                        คลิกเพื่ออัปโหลดรูป Selfie
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                        {errors.selfieImage && (
                                            <p className="text-xs text-destructive">
                                                {errors.selfieImage.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* License (Optional) */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            ใบอนุญาตนายหน้า (ถ้ามี)
                                        </label>
                                        <input
                                            ref={licenseRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, "licenseImage", setLicensePreview)}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => licenseRef.current?.click()}
                                            className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary hover:bg-accent"
                                        >
                                            {licensePreview ? (
                                                <img
                                                    src={licensePreview}
                                                    alt="License"
                                                    className="max-h-40 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <>
                                                    <FileCheck className="h-8 w-8 text-muted-foreground" />
                                                    <span className="text-muted-foreground">
                                                        คลิกเพื่ออัปโหลดใบอนุญาต (ไม่บังคับ)
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Terms */}
                                    <div className="rounded-lg bg-muted p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                            <div className="text-sm text-muted-foreground">
                                                <p>เมื่อส่งคำขอ คุณยอมรับว่า:</p>
                                                <ul className="mt-1 list-disc pl-4 space-y-1">
                                                    <li>ข้อมูลที่ให้เป็นความจริงทั้งหมด</li>
                                                    <li>ยินยอมให้ตรวจสอบข้อมูล</li>
                                                    <li>ยอมรับข้อกำหนดการเป็นตัวแทน</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Spinner size="sm" className="mr-2" />
                                                กำลังส่งคำขอ...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="mr-2 h-4 w-4" />
                                                ส่งคำขอยืนยันตัวตน
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Verified State */}
                    {currentStatus === "verified" && (
                        <Card>
                            <CardContent className="py-8 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                </div>
                                <h3 className="font-semibold text-lg">คุณเป็นตัวแทนแล้ว!</h3>
                                <p className="mt-2 text-muted-foreground">
                                    สามารถเริ่มลงประกาศขายหรือให้เช่าอสังหาริมทรัพย์ได้เลย
                                </p>
                                <div className="mt-6 flex justify-center gap-4">
                                    <Link href="/post-property">
                                        <Button>ลงประกาศอสังหา</Button>
                                    </Link>
                                    <Link href="/dashboard">
                                        <Button variant="outline">ไปหน้า Dashboard</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
