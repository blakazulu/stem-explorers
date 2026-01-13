"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getPostsByRoom, deletePost } from "@/lib/services/forum";
import { PostCard } from "@/components/forum/PostCard";
import { NewPostForm } from "@/components/forum/NewPostForm";
import { Button } from "@/components/ui/Button";
import type { ForumPost, ForumRoom } from "@/types";

const rooms: { id: ForumRoom; label: string }[] = [
  { id: "requests", label: "בקשות" },
  { id: "consultations", label: "התייעצויות" },
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-rubik font-bold">פורום</h1>
        <Button onClick={() => setShowNewPost(true)}>פוסט חדש</Button>
      </div>

      <div className="flex gap-2">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => setSelectedRoom(room.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedRoom === room.id
                ? "bg-primary text-white"
                : "bg-white text-foreground hover:bg-gray-100"
            }`}
          >
            {room.label}
          </button>
        ))}
      </div>

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

      {loading ? (
        <div className="text-gray-500">טוען פוסטים...</div>
      ) : posts.length === 0 ? (
        <p className="text-gray-500 text-center py-8">אין פוסטים בחדר זה</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserName={session?.user.name || ""}
              isAdmin={isAdmin}
              onDelete={handleDelete}
              onReplyAdded={loadPosts}
            />
          ))}
        </div>
      )}
    </div>
  );
}
