import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
  getBookings,
  getBookingsByDate,
  getBookingsByDateRange,
  getBookingsByExpert,
  createBooking,
  deleteBooking,
  deleteBookings,
} from "@/lib/services/bookings";
import type { ExpertBooking } from "@/types";

// Get all bookings (admin)
export function useBookings() {
  return useQuery({
    queryKey: queryKeys.bookings.all,
    queryFn: getBookings,
  });
}

// Get bookings for a specific date
export function useBookingsByDate(date: string | null) {
  return useQuery({
    queryKey: queryKeys.bookings.byDate(date!),
    queryFn: () => getBookingsByDate(date!),
    enabled: !!date,
  });
}

// Get bookings for a date range (e.g., current month)
export function useBookingsByDateRange(
  startDate: string | null,
  endDate: string | null
) {
  return useQuery({
    queryKey: queryKeys.bookings.byDateRange(startDate!, endDate!),
    queryFn: () => getBookingsByDateRange(startDate!, endDate!),
    enabled: !!startDate && !!endDate,
  });
}

// Get bookings for a specific expert
export function useBookingsByExpert(expertId: string | null) {
  return useQuery({
    queryKey: queryKeys.bookings.byExpert(expertId!),
    queryFn: () => getBookingsByExpert(expertId!),
    enabled: !!expertId,
  });
}

// Create a booking
export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (booking: Omit<ExpertBooking, "id" | "createdAt">) =>
      createBooking(booking),
    onSuccess: () => {
      // Invalidate all bookings queries (including byDate, byDateRange, byExpert)
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

// Delete a booking
export function useDeleteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      // Invalidate all bookings queries (simpler than tracking which specific ones)
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

// Delete multiple bookings
export function useDeleteBookings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBookings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
