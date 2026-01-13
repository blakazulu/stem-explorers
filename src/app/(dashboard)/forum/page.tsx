"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getPostsByRoom, deletePost } from "@/lib/services/forum";
import { PostCard } from "@/components/forum/PostCard";
import { NewPostForm } from "@/components/forum/NewPostForm";
import { Button } from "@/components/ui/Button";
import { SkeletonList } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  MessageSquare,
  Plus,
  HelpCircle,
  Users,
} from "lucide-react";
import type { ForumPost, ForumRoom } from "@/types";

const rooms: { id: ForumRoom; label: string; icon: typeof HelpCircle }[] = [
  { id: "requests", label: "בקשות", icon: HelpCircle },
  { id: "consultations", label: "התייעצויות", icon: Users },
];

export default function ForumPage() {
  const { session } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<ForumRoom>("requests");
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [loading, setLoading] = useState(true);

  const isAdmin = session?.user.role === "admin";

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const data = await getPostsByRoom(selectedRoom);
    setPosts(data);
    setLoading(false);
  }, [selectedRoom]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  async function handleDelete(id: string) {
    if (!confirm("האם למחוק פוסט זה?")) return;
    await deletePost(id);
    await loadPosts();
  }

  const currentRoom = rooms.find((r) => r.id === selectedRoom);

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
        {rooms.map((room) => {
          const IconComponent = room.icon;
          const isActive = selectedRoom === room.id;
          return (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-surface-0 text-primary shadow-sm"
                  : "text-gray-500 hover:text-foreground hover:bg-surface-0/50"
              }`}
            >
              <IconComponent size={18} />
              {room.label}
              {isActive && posts.length > 0 && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {posts.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* New Post Form */}
      {showNewPost && (
        <NewPostForm
          room={selectedRoom}
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
