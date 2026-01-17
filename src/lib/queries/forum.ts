import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
  getPosts,
  createPost,
  addReply,
  deletePost,
} from "@/lib/services/forum";
import type { ForumPost, ForumReply } from "@/types";

export function usePosts() {
  return useQuery({
    queryKey: queryKeys.forum.posts,
    queryFn: getPosts,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forum.posts });
    },
  });
}

export function useAddReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      reply,
    }: {
      postId: string;
      reply: Omit<ForumReply, "id" | "createdAt">;
    }) => addReply(postId, reply),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forum.posts });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forum.posts });
    },
  });
}
