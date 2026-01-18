"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { X, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRoleStyles } from "@/contexts/ThemeContext";
import { generateSlots, formatHebrewDate } from "@/lib/utils/slots";
import { canCancelBooking, getSessionToken } from "@/lib/utils/sessionToken";
import type { Expert, ExpertBooking } from "@/types";

interface TimeSlotsModalProps {
  isOpen: boolean;
  expert: Expert | null;
  date: string | null;
  bookings: ExpertBooking[];
  currentUserId: string;
  isAdmin: boolean;
  onBook: (startTime: string, endTime: string, participants: string, topic: string) => Promise<void>;
  onCancelBooking: (bookingId: string) => Promise<void>;
  onClose: () => void;
}

export function TimeSlotsModal({
  isOpen,
  expert,
  date,
  bookings,
  currentUserId,
  isAdmin,
  onBook,
  onCancelBooking,
  onClose,
}: TimeSlotsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const roleStyles = useRoleStyles();
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [participants, setParticipants] = useState("");
  const [topic, setTopic] = useState("");
  const [booking, setBooking] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [error, setError] = useState("");
  // Force re-render to update cancel button eligibility
  const [, setForceUpdate] = useState(0);

  // Auto-refresh cancel button eligibility every 30 seconds
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setForceUpdate((prev) => prev + 1);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
      setSelectedSlot(null);
      setParticipants("");
      setTopic("");
      setError("");
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // Generate slots for this expert and date
  const slots = useMemo(() => {
    if (!expert || !date) return [];

    const availability = expert.availability?.find((a) => a.date === date);
    if (!availability) return [];

    const expertBookings = bookings.filter((b) => b.expertId === expert.id);
    return generateSlots(availability.timeRanges, expertBookings);
  }, [expert, date, bookings]);

  const handleBook = async () => {
    if (!selectedSlot || !participants.trim() || !topic.trim()) {
      setError("יש למלא את כל השדות");
      return;
    }

    setBooking(true);
    setError("");

    try {
      await onBook(selectedSlot.start, selectedSlot.end, participants.trim(), topic.trim());
      setSelectedSlot(null);
      setParticipants("");
      setTopic("");
    } catch {
      setError("שגיאה בקביעת הפגישה. ייתכן שהזמן כבר תפוס.");
    }

    setBooking(false);
  };

  const handleCancel = async (bookingId: string) => {
    setCancelling(bookingId);
    try {
      await onCancelBooking(bookingId);
    } catch {
      setError("שגיאה בביטול הפגישה");
    }
    setCancelling(null);
  };

  if (!isOpen || !expert || !date) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto z-50 rounded-2xl p-0 backdrop:bg-black/50 backdrop:animate-fade-in max-w-lg w-[95vw] shadow-2xl animate-scale-in border-0 overflow-hidden"
      onClose={onClose}
    >
      <div className="flex flex-col" dir="rtl">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b border-surface-2 ${roleStyles.bgLight}`}>
          <div>
            <h2 className="text-lg font-rubik font-bold text-foreground">
              {expert.name}
            </h2>
            <p className="text-sm text-gray-500">{formatHebrewDate(date)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-surface-2 rounded-lg transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Slots Grid */}
        <div className="p-4 max-h-[50vh] overflow-y-auto">
          <div className="flex items-center gap-2 mb-3 text-gray-500">
            <Clock size={16} />
            <span className="text-sm">בחר שעה:</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {slots.map((slot) => {
              const isSelected = selectedSlot?.start === slot.startTime;
              const isOwnBooking = slot.booking?.userId === currentUserId;
              const canCancel = slot.booking && (
                isAdmin ||
                (isOwnBooking && canCancelBooking(slot.booking.sessionToken, slot.booking.createdAt))
              );

              return (
                <div key={slot.startTime} className="relative">
                  <button
                    onClick={() => {
                      if (!slot.isBooked) {
                        setSelectedSlot({ start: slot.startTime, end: slot.endTime });
                        setError("");
                      }
                    }}
                    disabled={slot.isBooked}
                    className={`
                      w-full py-2 px-3 rounded-lg text-sm font-medium transition-all
                      ${slot.isBooked
                        ? "bg-surface-2 text-gray-400 cursor-not-allowed"
                        : isSelected
                          ? `${roleStyles.bg} text-white`
                          : "bg-surface-1 hover:bg-surface-2 text-foreground cursor-pointer"
                      }
                    `}
                  >
                    {slot.startTime}
                    {slot.isBooked && (
                      <span className="block text-[10px] text-gray-400">תפוס</span>
                    )}
                  </button>

                  {/* Cancel button for own bookings or admin */}
                  {canCancel && (
                    <button
                      onClick={() => handleCancel(slot.booking!.id)}
                      disabled={cancelling === slot.booking!.id}
                      className="absolute -top-1 -left-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                      title="ביטול פגישה"
                    >
                      {cancelling === slot.booking!.id ? (
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={12} />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {slots.length === 0 && (
            <p className="text-center text-gray-400 py-8">
              אין זמנים זמינים ביום זה
            </p>
          )}
        </div>

        {/* Booking Form */}
        {selectedSlot && (
          <div className="p-4 border-t border-surface-2 bg-surface-1">
            <div className="mb-3">
              <p className="text-sm font-medium text-foreground mb-1">
                זמן נבחר: {selectedSlot.start} - {selectedSlot.end}
              </p>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                שמות המשתתפים בפגישה *
              </label>
              <input
                type="text"
                value={participants}
                onChange={(e) => setParticipants(e.target.value.slice(0, 200))}
                placeholder="שמות התלמידים/המורים שישתתפו"
                className="w-full px-3 py-2 rounded-lg border border-surface-3 bg-surface-0 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                maxLength={200}
              />
              <p className="text-xs text-gray-400 text-left mt-1">{participants.length}/200</p>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                נושא הפגישה *
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value.slice(0, 200))}
                placeholder="במה תרצה להתייעץ?"
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-surface-3 bg-surface-0 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none text-sm"
                maxLength={200}
              />
              <p className="text-xs text-gray-400 text-left mt-1">{topic.length}/200</p>
            </div>

            {error && (
              <p className="text-sm text-error bg-error/10 px-3 py-2 rounded-lg mb-3">
                {error}
              </p>
            )}

            <Button
              onClick={handleBook}
              loading={booking}
              disabled={!participants.trim() || !topic.trim()}
              className="w-full"
            >
              קבע פגישה
            </Button>
          </div>
        )}
      </div>
    </dialog>
  );
}
