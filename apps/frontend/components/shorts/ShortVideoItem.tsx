"use client";

import { useEffect, useRef, useState } from "react";
import { ShortVideo, shortsService } from "@/services/shorts/shorts.service";
import { useCurrentUser } from "@/hooks/queries/use-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  Share2,
  Plus,
  ArrowLeft,
  SendHorizontal,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

interface ShortVideoItemProps {
  video: ShortVideo;
  isActive: boolean;
}

export function ShortVideoItem({ video, isActive }: ShortVideoItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { data: currentUser } = useCurrentUser();
  const [isLiked, setIsLiked] = useState(video.isLiked);
  const [likesCount, setLikesCount] = useState(video.likesCount);
  const [isFollowing, setIsFollowing] = useState(video.isFollowing);
  const [showComments, setShowComments] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const videoElement = videoRef.current;

    if (isActive) {
      if (videoElement) {
        if (!videoElement.getAttribute("src")) {
          videoElement.setAttribute("src", video.videoUrl);
          videoElement.load();
        }
        videoElement.play().catch(() => {});
      }
    } else {
      videoElement?.pause();
      if (videoElement) {
        videoElement.currentTime = 0;
      }
    }

    // Cleanup on unmount or when isActive changes
    return () => {
      if (videoElement) {
        videoElement.pause();
        videoElement.removeAttribute("src"); // Stop buffering
        videoElement.load(); // Force reset
      }
    };
  }, [isActive, video.videoUrl]); // Added video.videoUrl dependency for safety

  const handleLike = async () => {
    const newStatus = !isLiked;
    setIsLiked(newStatus);
    setLikesCount((prev) => (newStatus ? prev + 1 : prev - 1));

    try {
      await shortsService.toggleLike(video.id);
    } catch (error) {
      setIsLiked(!newStatus);
      setLikesCount((prev) => (!newStatus ? prev + 1 : prev - 1));
    }
  };

  const handleFollow = async () => {
    const newStatus = !isFollowing;
    setIsFollowing(newStatus);

    try {
      await shortsService.toggleFollow(video.userId);
      toast.success(
        newStatus
          ? `ติดตาม ${video.user.name} แล้ว`
          : `เลิกติดตาม ${video.user.name} แล้ว`
      );
    } catch (error) {
      setIsFollowing(!newStatus);
    }
  };

  const handleDelete = async () => {
    if (!confirm("คุณต้องการลบวิดีโอนี้ใช่หรือไม่?")) return;
    try {
      await shortsService.deleteShort(video.id);
      toast.success("ลบวิดีโอสำเร็จ");
      queryClient.invalidateQueries({ queryKey: ["shorts", "feed"] });
    } catch (error) {
      toast.error("ลบไม่ได้");
    }
  };

  return (
    <div className="relative h-full w-full bg-black flex items-center justify-center snap-center">
      {/* Video Player */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        className="h-full w-full object-cover md:max-w-md mx-auto"
        loop
        playsInline
        muted={false} // Maybe allow unmuted by default or toggle
        onClick={(e) => {
          e.currentTarget.paused
            ? e.currentTarget.play()
            : e.currentTarget.pause();
        }}
      />

      {/* Overlay Info */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent md:max-w-md md:left-1/2 md:-translate-x-1/2">
        <div className="flex justify-between items-end mb-16 md:mb-4">
          <div className="flex-1 mr-12 text-white">
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
              @{video.user.name}
              {currentUser?.id !== video.userId && (
                <Button
                  size="sm"
                  variant={isFollowing ? "outline" : "default"}
                  className={cn(
                    "h-6 text-xs transition-all",
                    isFollowing && "bg-transparent text-white border-white/50"
                  )}
                  onClick={handleFollow}
                >
                  {isFollowing ? "กำลังติดตาม" : "ติดตาม"}
                </Button>
              )}
            </h3>
            <p className="opacity-90 line-clamp-2">{video.description}</p>
          </div>
        </div>
      </div>

      {/* Right Action Bar */}
      <div className="absolute bottom-20 right-2 flex flex-col items-center gap-6 md:right-[calc(50%-220px)]">
        <div className="relative">
          <Avatar className="w-12 h-12 border-2 border-white">
            <AvatarImage src={video.user.image || ""} />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          {!isFollowing && currentUser?.id !== video.userId && (
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-500 rounded-full p-0.5"
              onClick={handleFollow}
            >
              <Plus className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "rounded-full h-12 w-12 bg-black/20 hover:bg-black/40 text-white",
              isLiked && "text-red-500"
            )}
            onClick={handleLike}
          >
            <Heart className={cn("w-7 h-7", isLiked && "fill-current")} />
          </Button>
          <span className="text-xs font-semibold text-white shadow-black drop-shadow-md">
            {likesCount}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full h-12 w-12 bg-black/20 hover:bg-black/40 text-white"
            onClick={() => setShowComments(true)}
          >
            <MessageCircle className="w-7 h-7" />
          </Button>
          <span className="text-xs font-semibold text-white shadow-black drop-shadow-md">
            {video.commentsCount}
          </span>
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="rounded-full h-12 w-12 bg-black/20 hover:bg-black/40 text-white"
        >
          <Share2 className="w-7 h-7" />
        </Button>

        {currentUser?.id === video.userId && (
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full h-10 w-10 bg-black/20 hover:bg-destructive/80 text-white mt-4"
            onClick={handleDelete}
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Comments Drawer/Modal (Simplified as overlay for now) */}
      {showComments && (
        <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm md:max-w-md md:mx-auto animate-in slide-in-from-bottom flex flex-col">
          <div className="flex items-center p-4 border-b">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowComments(false)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h3 className="flex-1 text-center font-semibold">
              ความคิดเห็น ({video.commentsCount})
            </h3>
            <div className="w-9" />
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <ShortCommentsList videoId={video.id} />
          </div>

          <AddCommentInput
            videoId={video.id}
            onAdded={() => {
              // Optimistic update handled by query invalidation in component
            }}
          />
        </div>
      )}
    </div>
  );
}

function ShortCommentsList({ videoId }: { videoId: string }) {
  const { data: comments, isLoading } = useQuery({
    queryKey: ["shorts", "comments", videoId],
    queryFn: () => shortsService.getComments(videoId),
  });

  if (isLoading)
    return (
      <p className="text-center py-4 text-muted-foreground">กำลังโหลด...</p>
    );

  // Type assertion because of shared types confusion in previous steps, safe here
  // Service returns ApiResponse<ShortComment[]> from frontend service
  // But frontend service returns response.data
  // So it is ShortComment[]
  const list = comments || [];

  if (list.length === 0)
    return (
      <p className="text-center py-10 text-muted-foreground">
        ยังไม่มีความคิดเห็น
      </p>
    );

  return (
    <div className="space-y-4">
      {list.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={comment.user.image || ""} />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{comment.user.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                  locale: th,
                })}
              </span>
            </div>
            <p className="text-sm text-foreground/90">{comment.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function AddCommentInput({
  videoId,
  onAdded,
}: {
  videoId: string;
  onAdded: () => void;
}) {
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (text: string) => shortsService.addComment(videoId, text),
    onSuccess: () => {
      setContent("");
      onAdded();
      queryClient.invalidateQueries({
        queryKey: ["shorts", "comments", videoId],
      });
      // Also invalidate feed to update comment count
      queryClient.invalidateQueries({ queryKey: ["shorts", "feed"] });
    },
    onError: () => {
      toast.error("ส่งความเห็นไม่สำเร็จ");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    mutate(content);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="เพิ่มความคิดเห็น..."
        className="flex-1 rounded-full"
        disabled={isPending}
      />
      <Button
        size="icon"
        type="submit"
        disabled={!content.trim() || isPending}
        className="rounded-full"
      >
        <SendHorizontal className="w-4 h-4" />
      </Button>
    </form>
  );
}
