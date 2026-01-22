import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
  getAllAnnouncements,
  getAnnouncementsByGrade,
  createAnnouncement,
  updateAnnouncement,
  addAnnouncementComment,
  deleteAnnouncement,
  deleteAnnouncementComment,
} from "@/lib/services/announcements";
import type { Announcement, AnnouncementComment, Grade } from "@/types";

// Get all announcements (admin)
export function useAllAnnouncements() {
  return useQuery({
    queryKey: queryKeys.announcements.all,
    queryFn: getAllAnnouncements,
  });
}

// Get announcements by grade (student)
export function useAnnouncementsByGrade(grade: Grade | null) {
  return useQuery({
    queryKey: queryKeys.announcements.byGrade(grade!),
    queryFn: () => getAnnouncementsByGrade(grade!),
    enabled: !!grade,
  });
}

// Create announcement (admin)
export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
    },
  });
}

// Update announcement (admin)
export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Pick<Announcement, "content" | "imageUrl" | "targetGrade" | "allowedCommentGrades">>;
    }) => updateAnnouncement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

// Add comment (student)
export function useAddAnnouncementComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      announcementId,
      comment,
    }: {
      announcementId: string;
      comment: Omit<AnnouncementComment, "id" | "createdAt">;
    }) => addAnnouncementComment(announcementId, comment),
    onSuccess: () => {
      // Invalidate all announcement queries since we don't know which grade's view needs updating
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

// Delete announcement (admin)
export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      // Invalidate all announcement queries (both all and grade-filtered)
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

// Delete comment (admin)
export function useDeleteAnnouncementComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      announcementId,
      commentId,
    }: {
      announcementId: string;
      commentId: string;
    }) => deleteAnnouncementComment(announcementId, commentId),
    onSuccess: () => {
      // Invalidate all announcement queries (both all and grade-filtered)
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}
