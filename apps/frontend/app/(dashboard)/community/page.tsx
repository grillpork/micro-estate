"use client";

import { useQuery } from "@tanstack/react-query";
import { socialService, Post } from "@/services/social/social.service";
import { CreatePostForm } from "@/components/social/CreatePostForm";
import { PostCard } from "@/components/social/PostCard";
import { Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CommunityPage() {
  const {
    data: posts,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["social", "feed"],
    queryFn: () => socialService.getFeed(),
  });

  const feedPosts = posts || [];

  return (
    <div className="container max-w-2xl py-8 px-4 md:px-0 space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            ชุมชน (Community)
          </h1>
          <p className="text-muted-foreground">
            พื้นที่พูดคุย แลกเปลี่ยน และอัปเดตข่าวสาร
          </p>
        </div>
      </div>

      <CreatePostForm />

      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="text-center py-10 space-y-4">
            <p className="text-destructive">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
            <Button variant="outline" onClick={() => refetch()}>
              ลองใหม่อีกครั้ง
            </Button>
          </div>
        ) : feedPosts.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
            ยังไม่มีโพสต์ในขณะนี้ มาเป็นคนแรกที่โพสต์กันเถอะ!
          </div>
        ) : (
          feedPosts.map((post: Post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
