"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { User, Mail, Phone, Save, CheckCircle2, Settings } from "lucide-react";
import { toast } from "sonner";

import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui";
import { FormField } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";
import { api } from "@/services";

// Validation schema
const profileSchema = z.object({
  name: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร"),
  phone: z.string().optional(),
  bio: z.string().max(500, "ประวัติย่อต้องไม่เกิน 500 ตัวอักษร").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
  defaultValues: {
    name: string;
    email: string;
    phone?: string;
    bio?: string;
  };
}

function Loader2({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin",
        className
      )}
    />
  );
}

export function ProfileEditForm({ defaultValues }: ProfileEditFormProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm({
    defaultValues: {
      name: defaultValues.name || "",
      phone: defaultValues.phone || "",
      bio: defaultValues.bio || "",
    } as ProfileFormData,
    onSubmit: async ({ value }: { value: ProfileFormData }) => {
      setIsUpdating(true);
      try {
        await api.patch("/users/profile", value);
        toast.success("อัปเดตโปรไฟล์สำเร็จ");
      } catch {
        toast.error("ไม่สามารถอัปเดตโปรไฟล์ได้");
      } finally {
        setIsUpdating(false);
      }
    },
  });

  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-zinc-950">
      <div className="h-1.5 bg-primary/40" />
      <CardHeader className="md:px-8 pt-8">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-black">
              แก้ไขข้อมูลโปรไฟล์
            </CardTitle>
            <CardDescription>
              รายละเอียดเบื้องต้นและการติดต่อของคุณ
            </CardDescription>
          </div>
          <Settings className="h-6 w-6 text-muted-foreground/30" />
        </div>
      </CardHeader>
      <CardContent className="md:px-8 pb-10 pt-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-8"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                ชื่อ-นามสกุล <span className="text-destructive">*</span>
              </label>
              <FormField
                form={form}
                name="name"
                label=""
                placeholder="กรอกชื่อ-นามสกุล"
                validator={profileSchema.shape.name}
                className="space-y-0"
              >
                {(field) => (
                  <>
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="กรอกชื่อ-นามสกุล"
                      className="h-12 rounded-xl bg-muted/30 border-none focus-visible:ring-primary shadow-none transition-all focus-visible:bg-background"
                      disabled={isUpdating}
                    />
                    {field.state.meta.errors ? (
                      <p className="text-xs font-medium text-destructive mt-1 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />{" "}
                        {field.state.meta.errors.join(", ")}
                      </p>
                    ) : null}
                  </>
                )}
              </FormField>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                อีเมล (ไม่สามารถเปลี่ยนได้)
              </label>
              <Input
                value={defaultValues.email}
                className="h-12 rounded-xl bg-muted/60 border-none cursor-not-allowed text-muted-foreground opacity-80"
                disabled
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                เบอร์โทรศัพท์
              </label>
              <FormField
                form={form}
                name="phone"
                label=""
                validator={profileSchema.shape.phone}
                className="space-y-0"
              >
                {(field) => (
                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="0xx-xxx-xxxx"
                    className="h-12 rounded-xl bg-muted/30 border-none focus-visible:ring-primary shadow-none transition-all focus-visible:bg-background"
                    disabled={isUpdating}
                  />
                )}
              </FormField>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              แนะนำตัว / ประวัติย่อ
            </label>
            <FormField
              form={form}
              name="bio"
              label=""
              validator={profileSchema.shape.bio}
              className="space-y-0"
            >
              {(field) => (
                <textarea
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="เขียนข้อมูลแนะนำตัวเพื่อให้ลูกค้ามั่นใจในตัวคุณ..."
                  className="flex min-h-[140px] w-full rounded-2xl border-none bg-muted/30 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all focus-visible:bg-background"
                  disabled={isUpdating}
                />
              )}
            </FormField>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground italic">
              ข้อมูลของคุณจะถูกใช้แสดงผลในหน้าโปรไฟล์สาธารณะ
            </p>
            <form.Subscribe
              selector={(state) => [
                state.canSubmit,
                state.isSubmitting,
                state.isDirty,
              ]}
              children={([canSubmit, isSubmitting, isDirty]) => (
                <Button
                  type="submit"
                  disabled={isUpdating || !isDirty}
                  className="w-full sm:w-auto min-w-[180px] h-12 rounded-xl font-bold bg-primary shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  {isUpdating || isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      บันทึกการเปลี่ยนแปลง
                    </>
                  )}
                </Button>
              )}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
