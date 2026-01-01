"use client";

import { useState } from "react";
import { UserAvatar } from "./UserAvatar";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { Post, socialService } from "@/services/social/social.service";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Heart,
  Share2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/queries/use-user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { CommentSection } from "./CommentSection";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { data: currentUser } = useCurrentUser();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showComments, setShowComments] = useState(false);
  const queryClient = useQueryClient();

  const handleLike = async () => {
    // Optimistic update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

    try {
      await socialService.toggleLike(post.id);
    } catch (error) {
      // Revert if failed
      setIsLiked(!newIsLiked);
      setLikesCount((prev) => (!newIsLiked ? prev + 1 : prev - 1));
    }
  };

  const handleDelete = async () => {
    if (!confirm("คุณต้องการลบโพสต์นี้ใช่หรือไม่?")) return;
    try {
      await socialService.deletePost(post.id);
      toast.success("ลบโพสต์สำเร็จ");
      queryClient.invalidateQueries({ queryKey: ["social", "feed"] });
    } catch (error) {
      toast.error("ไม่สามารถลบโพสต์ได้");
    }
  };

  const isOwner = currentUser?.id === post.userId;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <UserAvatar user={post.user} />
            <div>
              <div className="font-semibold">{post.user.name}</div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                  locale: th,
                })}
              </div>
            </div>
          </div>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  ลบโพสต์
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {post.content && (
          <p className="mt-4 text-[15px] leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        )}
      </div>

      {post.images && post.images.length > 0 && (
        <div
          className={cn(
            "grid gap-0.5",
            post.images.length > 1 ? "grid-cols-2" : "grid-cols-1"
          )}
        >
          {post.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt="Post content"
              className="w-full h-auto object-cover max-h-[500px]"
            />
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-2 text-xs text-muted-foreground flex justify-between border-t mt-2">
        <span>{likesCount} ถูกใจ</span>
        <div className="flex gap-3">
          <span>{post.commentsCount} ความคิดเห็น</span>
          <span>{post.sharesCount} แชร์</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-2 py-1 flex justify-between border-t border-b">
        <Button
          variant="ghost"
          className={cn(
            "flex-1 gap-2 hover:bg-muted/50",
            isLiked && "text-blue-600"
          )}
          onClick={handleLike}
        >
          <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
          ถูกใจ
        </Button>
        <Button
          variant="ghost"
          className="flex-1 gap-2 hover:bg-muted/50"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="w-5 h-5" />
          ความคิดเห็น
        </Button>
        <Button variant="ghost" className="flex-1 gap-2 hover:bg-muted/50">
          <Share2 className="w-5 h-5" />
          แชร์
        </Button>
      </div>

      {showComments && (
        <div className="bg-muted/20 p-4 border-t">
          <CommentSection postId={post.id} />
        </div>
      )}
    </div>
  );
}
