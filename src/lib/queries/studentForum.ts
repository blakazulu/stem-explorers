import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
  getStudentPosts,
  createStudentPost,
  addStudentReply,
  deleteStudentPost,
  updateStudentPost,
  pinStudentPost,
} from "@/lib/services/studentForum";
import type { ForumReply } from "@/types";

export function useStudentPosts() {
  return useQuery({
    queryKey: queryKeys.studentForum.posts,
    queryFn: getStudentPosts,
  });
}

export function useCreateStudentPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStudentPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.studentForum.posts });
    },
  });
}

export function useAddStudentReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      reply,
    }: {
      postId: string;
      reply: Omit<ForumReply, "id" | "createdAt">;
    }) => addStudentReply(postId, reply),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.studentForum.posts });
    },
  });
}

export function useDeleteStudentPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStudentPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.studentForum.posts });
    },
  });
}

export function useUpdateStudentPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title: string; content: string } }) =>
      updateStudentPost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.studentForum.posts });
    },
  });
}

export function usePinStudentPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, pinned }: { id: string; pinned: boolean }) =>
      pinStudentPost(id, pinned),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.studentForum.posts });
    },
  });
}
