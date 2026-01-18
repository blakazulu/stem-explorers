"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts, useDeletePost, useUpdatePost, usePinPost } from "@/lib/queries";
import { PostCard } from "@/components/forum/PostCard";
import { NewPostForm } from "@/components/forum/NewPostForm";
import { Button } from "@/components/ui/Button";
import { SkeletonList } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToastActions } from "@/components/ui/Toast";
import { MessageSquare, Plus, ChevronRight, ChevronLeft } from "lucide-react";

const POSTS_PER_PAGE = 10;

export default function ForumPage() {
  const { session } = useAuth();

  const {
    data: posts = [],
    isLoading: loading,
    refetch: loadPosts,
  } = usePosts();
  const [showNewPost, setShowNewPost] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const toast = useToastActions();
  const deletePostMutation = useDeletePost();
  const updatePostMutation = useUpdatePost();
  const pinPostMutation = usePinPost();

  const isAdmin = session?.user.role === "admin";

  // Sort posts: pinned first, then by creation date
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0; // Keep original order (by createdAt desc from server)
    });
  }, [posts]);

  // Pagination
  const totalPages = Math.ceil(sortedPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    return sortedPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  }, [sortedPosts, currentPage]);

  // Clamp currentPage if posts are deleted and current page no longer exists
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  async function handleDelete(id: string) {
    if (!confirm("האם למחוק פוסט זה?")) return;
    try {
      await deletePostMutation.mutateAsync(id);
    } catch {
      toast.error("שגיאה", "שגיאה במחיקת הפוסט");
    }
  }

  async function handlePin(id: string, pinned: boolean) {
    try {
      await pinPostMutation.mutateAsync({ id, pinned });
      toast.success("עודכן", pinned ? "הפוסט הוצמד" : "הפוסט בוטל מהצמדה");
    } catch {
      toast.error("שגיאה", "שגיאה בעדכון הפוסט");
    }
  }

  async function handleEdit(id: string, title: string, content: string) {
    try {
      await updatePostMutation.mutateAsync({ id, data: { title, content } });
      toast.success("עודכן", "הפוסט עודכן בהצלחה");
    } catch {
      toast.error("שגיאה", "שגיאה בעדכון הפוסט");
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
        <>
          <div className="space-y-4">
            {paginatedPosts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserName={session?.user.name || ""}
                isAdmin={isAdmin}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onPin={handlePin}
                onReplyAdded={loadPosts}
                index={index}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                rightIcon={ChevronRight}
              >
                הקודם
              </Button>
              <span className="px-4 py-2 text-sm text-gray-600">
                עמוד {currentPage} מתוך {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                rightIcon={ChevronLeft}
              >
                הבא
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
