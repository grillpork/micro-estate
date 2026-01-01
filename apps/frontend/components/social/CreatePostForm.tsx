"use client";

import { useState } from "react";
import { UserAvatar } from "./UserAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader2 } from "lucide-react";
import { useCurrentUser as useUser } from "@/hooks/queries/use-user";
import { socialService } from "@/services/social/social.service";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function CreatePostForm() {
  const { data: user } = useUser();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await socialService.createPost(content);
      setContent("");
      toast.success("โพสต์เรียบร้อยแล้ว");
      // Invalidate feed query to refresh
      queryClient.invalidateQueries({ queryKey: ["social", "feed"] });
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการโพสต์");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border shadow-sm p-4 space-y-4">
      <div className="flex gap-4">
        <UserAvatar user={user} />
        <Textarea
          placeholder={`คุณ ${user.name} กำลังคิดอะไรอยู่?`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="resize-none border-none focus-visible:ring-0 bg-transparent text-lg min-h-[80px]"
        />
      </div>
      <div className="flex justify-between items-center pt-2 border-t">
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <ImagePlus className="w-5 h-5 mr-2" />
          รูปภาพ/วิดีโอ
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className="rounded-full px-6"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          โพสต์
        </Button>
      </div>
    </div>
  );
}
