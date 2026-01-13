"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getPostsByRoom, deletePost } from "@/lib/services/forum";
import { PostCard } from "@/components/forum/PostCard";
import { NewPostForm } from "@/components/forum/NewPostForm";
import { Button } from "@/components/ui/Button";
import { SkeletonList } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToastActions } from "@/components/ui/Toast";
import {
  MessageSquare,
  Plus,
  HelpCircle,
  Users,
} from "lucide-react";
import type { ForumPost, ForumRoom, UserRole } from "@/types";

const rooms: { id: ForumRoom; label: string; icon: typeof HelpCircle }[] = [
  { id: "requests", label: "בקשות", icon: HelpCircle },
  { id: "consultations", label: "התייעצויות", icon: Users },
];

const VALID_ROOMS: ForumRoom[] = ["requests", "consultations"];

export default function ForumRoomPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();

  const role = params.role as UserRole;
  const room = params.room as ForumRoom;

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToastActions();

  const isAdmin = session?.user.role === "admin";

  // Validate room
  useEffect(() => {
    if (!VALID_ROOMS.includes(room)) {
      router.replace(`/${role}/forum/requests`);
    }
  }, [room, role, router]);

  const loadPosts = useCallback(async () => {
    if (!VALID_ROOMS.includes(room)) return;
    setLoading(true);
    try {
      const data = await getPostsByRoom(room);
      setPosts(data);
    } catch {
      toast.error("שגיאה", "שגיאה בטעינת הפוסטים");
    }
    setLoading(false);
  }, [room, toast]);

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

  const currentRoom = rooms.find((r) => r.id === room);

  if (!VALID_ROOMS.includes(room)) {
    return null;
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
              פורום
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

      {/* Room Tabs */}
      <div className="flex gap-2 p-1 bg-surface-1 rounded-xl">
        {rooms.map((r) => {
          const IconComponent = r.icon;
          const isActive = room === r.id;
          return (
            <Link
              key={r.id}
              href={`/${role}/forum/${r.id}`}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-surface-0 text-primary shadow-sm"
                  : "text-gray-500 hover:text-foreground hover:bg-surface-0/50"
              }`}
            >
              <IconComponent size={18} />
              {r.label}
              {isActive && posts.length > 0 && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {posts.length}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* New Post Form */}
      {showNewPost && (
        <NewPostForm
          room={room}
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
          title={`אין פוסטים ב${currentRoom?.label || "חדר זה"}`}
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
