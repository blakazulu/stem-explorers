"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getPosts, deletePost } from "@/lib/services/forum";
import { PostCard } from "@/components/forum/PostCard";
import { NewPostForm } from "@/components/forum/NewPostForm";
import { Button } from "@/components/ui/Button";
import { SkeletonList } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToastActions } from "@/components/ui/Toast";
import { MessageSquare, Plus } from "lucide-react";
import type { ForumPost } from "@/types";

export default function ForumPage() {
  const { session } = useAuth();

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToastActions();

  const isAdmin = session?.user.role === "admin";

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPosts();
      setPosts(data);
    } catch {
      toast.error("שגיאה", "שגיאה בטעינת הפוסטים");
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  async function handleDelete(id: string) {
    if (!confirm("האם למחוק פוסט זה?")) return;
    try {
      await deletePost(id);
      await loadPosts();
    } catch {
      toast.error("שגיאה", "שגיאה במחיקת הפוסט");
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
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
