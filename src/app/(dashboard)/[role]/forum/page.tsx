"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts, useDeletePost } from "@/lib/queries";
import { PostCard } from "@/components/forum/PostCard";
import { NewPostForm } from "@/components/forum/NewPostForm";
import { Button } from "@/components/ui/Button";
import { SkeletonList } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToastActions } from "@/components/ui/Toast";
import { MessageSquare, Plus } from "lucide-react";

export default function ForumPage() {
  const { session } = useAuth();

  const {
    data: posts = [],
    isLoading: loading,
    refetch: loadPosts,
  } = usePosts();
  const [showNewPost, setShowNewPost] = useState(false);
  const toast = useToastActions();
  const deletePostMutation = useDeletePost();

  const isAdmin = session?.user.role === "admin";

  async function handleDelete(id: string) {
    if (!confirm("האם למחוק פוסט זה?")) return;
    try {
      await deletePostMutation.mutateAsync(id);
    } catch {
      toast.error("שגיאה", "שגיאה במחיקת הפוסט");
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-role-teacher/10 rounded-xl">
            <MessageSquare size={24} className="text-role-teacher" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
              במה אישית
            </h1>
            <p className="text-sm text-gray-500">
              שיתוף ודיונים עם צוות המורים
            </p>
          </div>
        </div>
        {!showNewPost && (
          <Button onClick={() => setShowNewPost(true)} rightIcon={Plus}>
            פוסט חדש
          </Button>
        )}
      </div>

      {/* New Post Form */}
      {showNewPost && (
        <NewPostForm
          authorName={session?.user.name || ""}
          onCreated={() => {
            setShowNewPost(false);
            loadPosts();
          }}
          onCancel={() => setShowNewPost(false)}
        />
      )}

      {/* Posts List */}
      {loading ? (
        <SkeletonList count={3} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon="message-square"
          title="אין פוסטים עדיין"
          description="היה הראשון לשתף משהו עם הקהילה"
          action={
            <Button onClick={() => setShowNewPost(true)} rightIcon={Plus}>
              פוסט חדש
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserName={session?.user.name || ""}
              isAdmin={isAdmin}
              onDelete={handleDelete}
              onReplyAdded={loadPosts}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
