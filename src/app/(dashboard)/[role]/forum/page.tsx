"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  usePosts,
  useDeletePost,
  useUpdatePost,
  usePinPost,
  useStudentPosts,
  useDeleteStudentPost,
  useUpdateStudentPost,
  usePinStudentPost,
} from "@/lib/queries";
import { PostCard } from "@/components/forum/PostCard";
import { NewPostForm } from "@/components/forum/NewPostForm";
import { Button } from "@/components/ui/Button";
import { SkeletonList } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToastActions } from "@/components/ui/Toast";
import { MessageSquare, Plus, ChevronRight, ChevronLeft, Users, GraduationCap } from "lucide-react";
import type { ForumType } from "@/types";

const POSTS_PER_PAGE = 10;

export default function ForumPage() {
  const { session } = useAuth();

  // Use session role consistently for security
  const userRole = session?.user.role;
  const isAdmin = userRole === "admin";
  const isStudent = userRole === "student";

  // Get student's grade for filtering
  const studentGrade = session?.user.grade;

  // Determine which forum to show by default
  const defaultForumType: ForumType = isStudent ? "student" : "teacher";
  const [activeForumType, setActiveForumType] = useState<ForumType>(defaultForumType);

  // Update activeForumType if role changes (e.g., navigating)
  useEffect(() => {
    if (!isAdmin) {
      setActiveForumType(isStudent ? "student" : "teacher");
    }
  }, [isAdmin, isStudent]);

  // Teacher forum hooks
  const {
    data: teacherPosts = [],
    isLoading: teacherLoading,
  } = usePosts();
  const deleteTeacherPostMutation = useDeletePost();
  const updateTeacherPostMutation = useUpdatePost();
  const pinTeacherPostMutation = usePinPost();

  // Student forum hooks - students see only their grade, admin sees all
  const {
    data: studentPosts = [],
    isLoading: studentLoading,
  } = useStudentPosts(isStudent ? (studentGrade ?? undefined) : undefined);
  const deleteStudentPostMutation = useDeleteStudentPost();
  const updateStudentPostMutation = useUpdateStudentPost();
  const pinStudentPostMutation = usePinStudentPost();

  // Current forum data based on active type
  const posts = activeForumType === "student" ? studentPosts : teacherPosts;
  const loading = activeForumType === "student" ? studentLoading : teacherLoading;
  const deletePostMutation = activeForumType === "student" ? deleteStudentPostMutation : deleteTeacherPostMutation;
  const updatePostMutation = activeForumType === "student" ? updateStudentPostMutation : updateTeacherPostMutation;
  const pinPostMutation = activeForumType === "student" ? pinStudentPostMutation : pinTeacherPostMutation;

  const [showNewPost, setShowNewPost] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const toast = useToastActions();

  // Reset page when switching forums
  useEffect(() => {
    setCurrentPage(1);
    setShowNewPost(false);
  }, [activeForumType]);

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

  // Early return if no session (shouldn't happen in protected routes)
  if (!session) {
    return <SkeletonList count={3} />;
  }

  // Forum header config based on type and role
  const forumConfig = {
    teacher: {
      title: "במה אישית",
      subtitle: "שיתוף ודיונים עם צוות המורים",
      icon: MessageSquare,
      iconBg: "bg-role-teacher/10",
      iconColor: "text-role-teacher",
    },
    student: {
      title: "תיעוד איסוף הנתונים",
      subtitle: "שתפו תצפיות וממצאים מהמחקר",
      icon: MessageSquare,
      iconBg: "bg-role-student/10",
      iconColor: "text-role-student",
    },
  };

  // Admin sees combined title
  const currentConfig = isAdmin
    ? {
        title: "פורומים",
        subtitle: "ניהול פורומים של מורים ותלמידים",
        icon: MessageSquare,
        iconBg: "bg-role-admin/10",
        iconColor: "text-role-admin",
      }
    : forumConfig[activeForumType];

  const HeaderIcon = currentConfig.icon;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 ${currentConfig.iconBg} rounded-xl`}>
            <HeaderIcon size={24} className={currentConfig.iconColor} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
              {currentConfig.title}
            </h1>
            <p className="text-sm text-gray-500">
              {currentConfig.subtitle}
            </p>
          </div>
        </div>
        {!showNewPost && (
          <Button onClick={() => setShowNewPost(true)} rightIcon={Plus}>
            פוסט חדש
          </Button>
        )}
      </div>

      {/* Admin Forum Tabs */}
      {isAdmin && (
        <div className="flex gap-2 border-b border-surface-2 pb-1">
          <button
            onClick={() => setActiveForumType("teacher")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium transition-all cursor-pointer ${
              activeForumType === "teacher"
                ? "bg-role-teacher/10 text-role-teacher border-b-2 border-role-teacher"
                : "text-gray-500 hover:text-gray-700 hover:bg-surface-1"
            }`}
          >
            <GraduationCap size={18} />
            מורים
          </button>
          <button
            onClick={() => setActiveForumType("student")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium transition-all cursor-pointer ${
              activeForumType === "student"
                ? "bg-role-student/10 text-role-student border-b-2 border-role-student"
                : "text-gray-500 hover:text-gray-700 hover:bg-surface-1"
            }`}
          >
            <Users size={18} />
            תלמידים
          </button>
        </div>
      )}

      {/* New Post Form */}
      {showNewPost && (
        <NewPostForm
          authorName={session.user.name}
          authorGrade={isAdmin ? "all" : (studentGrade ?? undefined)}
          forumType={activeForumType}
          onCreated={() => setShowNewPost(false)}
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
          description={
            activeForumType === "student"
              ? "היו הראשונים לשתף תצפיות וממצאים מהמחקר"
              : "היה הראשון לשתף משהו עם הקהילה"
          }
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
                currentUserName={session.user.name}
                isAdmin={isAdmin}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onPin={handlePin}
                onReplyAdded={() => {}}
                index={index}
                forumType={activeForumType}
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
