"use client";

import { useState } from "react";
import { UserAvatar } from "./UserAvatar";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { Comment, socialService } from "@/services/social/social.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  MessageCircle,
  Loader2,
  Trash2,
  SendHorizontal as Send,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/queries/use-user";
import { toast } from "sonner";

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { data: currentUser } = useCurrentUser();
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ["social", "comments", postId],
    queryFn: () => socialService.getComments(postId),
  });

  // API returns ApiResponse<Comment[]> so data is Comment[]
  const displayComments = comments || [];
  // Note: API returns array directly in service wrapper? NO, socialService.getComments maps to response.data which is array.
  // Wait, let's check service implementation.
  // Service: return response.data. And API returns success(c, comments).
  // So comments is PostComment[].
  // But wait, my interface says ApiResponse<Comment[]>. So response.data is Comment[].
  // So query data is Comment[].
  const commentsList = (comments as unknown as Comment[]) || []; // Casting to be safe based on service return

  const addCommentMutation = useMutation({
    mutationFn: (text: string) => socialService.addComment(postId, text),
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({
        queryKey: ["social", "comments", postId],
      });
    },
    onError: () => {
      toast.error("ไม่สามารถแสดงความคิดเห็นได้");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => socialService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["social", "comments", postId],
      });
    },
    onError: () => {
      toast.error("ลบความคิดเห็นไม่สำเร็จ");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addCommentMutation.mutate(content);
  };

  return (
    <div className="space-y-4">
      {/* Comment List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : commentsList.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-2">
            ยังไม่มีความคิดเห็น
          </p>
        ) : (
          commentsList.map((comment) => (
            <div key={comment.id} className="flex gap-3 group">
              <UserAvatar user={comment.user} className="w-8 h-8" />
              <div className="flex-1">
                <div className="bg-muted px-3 py-2 rounded-2xl inline-block min-w-[150px]">
                  <div className="font-semibold text-sm">
                    {comment.user.name}
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
                <div className="flex items-center gap-2 mt-1 px-2 text-xs text-muted-foreground">
                  <span>
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                      locale: th,
                    })}
                  </span>
                  {currentUser?.id === comment.userId && (
                    <button
                      onClick={() => deleteCommentMutation.mutate(comment.id)}
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ลบ
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Input */}
      <div className="flex gap-3 items-start">
        {currentUser && <UserAvatar user={currentUser} className="w-8 h-8" />}
        <form onSubmit={handleSubmit} className="flex-1 relative">
          <Input
            placeholder="แสดงความคิดเห็น..."
            className="rounded-full bg-muted/50 border-transparent focus:bg-background pr-12"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={addCommentMutation.isPending}
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1 h-8 w-8 rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            disabled={!content.trim() || addCommentMutation.isPending}
            type="submit"
          >
            {addCommentMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
