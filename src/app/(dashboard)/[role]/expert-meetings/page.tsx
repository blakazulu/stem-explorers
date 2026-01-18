"use client";

import { useState, useMemo } from "react";
import { redirect, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings, useDeleteBooking, useExperts } from "@/lib/queries";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToastActions } from "@/components/ui/Toast";
import { Trash2, Search, Calendar, Clock, User, Users, BookOpen } from "lucide-react";
import { formatHebrewDate } from "@/lib/utils/slots";
import type { ExpertBooking, Grade } from "@/types";

type TabType = "upcoming" | "past";

const ROLE_LABELS: Record<string, string> = {
  admin: "מנהל",
  teacher: "מורה",
  parent: "הורה",
  student: "תלמיד",
};

export default function ExpertMeetingsPage() {
  const { session } = useAuth();
  const params = useParams();

  // Redirect non-admin users
  if (session && session.user.role !== "admin") {
    redirect(`/${params.role}`);
  }

  const { data: bookings = [], isLoading } = useBookings();
  const { data: experts = [] } = useExperts();

  // Create expert lookup map
  const expertNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    experts.forEach((e) => {
      map[e.id] = e.name;
    });
    return map;
  }, [experts]);
  const deleteBookingMutation = useDeleteBooking();
  const toast = useToastActions();

  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<Grade | "all">("all");
  const [deleteConfirm, setDeleteConfirm] = useState<ExpertBooking | null>(null);
  const [deleting, setDeleting] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  // Filter and sort bookings
  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        // Tab filter
        const isUpcoming = b.date >= today;
        if (activeTab === "upcoming" && !isUpcoming) return false;
        if (activeTab === "past" && isUpcoming) return false;

        // Grade filter
        if (gradeFilter !== "all" && b.userGrade !== gradeFilter) return false;

        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            b.userName.toLowerCase().includes(query) ||
            b.topic.toLowerCase().includes(query)
          );
        }

        return true;
      })
      .sort((a, b) => {
        // Sort by date, then time
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return activeTab === "upcoming" ? dateCompare : -dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });
  }, [bookings, activeTab, gradeFilter, searchQuery, today]);

  const handleDelete = async () => {
    if (!deleteConfirm || deleting) return;

    setDeleting(true);
    try {
      await deleteBookingMutation.mutateAsync(deleteConfirm.id);
      toast.success("נמחק", "הפגישה נמחקה בהצלחה");
    } catch {
      toast.error("שגיאה", "שגיאה במחיקת הפגישה");
    }
    setDeleting(false);
    setDeleteConfirm(null);
  };

  const grades: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-rubik font-bold text-foreground mb-2">
          ניהול פגישות מומחים
        </h1>
        <p className="text-gray-500">צפייה וניהול של כל פגישות הייעוץ</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
            activeTab === "upcoming"
              ? "bg-primary text-white"
              : "bg-surface-1 text-foreground hover:bg-surface-2"
          }`}
        >
          פגישות קרובות
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
            activeTab === "past"
              ? "bg-primary text-white"
              : "bg-surface-1 text-foreground hover:bg-surface-2"
          }`}
        >
          פגישות קודמות
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חיפוש לפי שם או נושא..."
            className="w-full pr-10 pl-4 py-2 rounded-lg border border-surface-3 bg-surface-0 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Grade Filter */}
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value as Grade | "all")}
          className="px-4 py-2 rounded-lg border border-surface-3 bg-surface-0 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
        >
          <option value="all">כל הכיתות</option>
          {grades.map((g) => (
            <option key={g} value={g}>כיתה {g}</option>
          ))}
        </select>
      </div>

      {/* Meetings Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-surface-1 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-surface-1 rounded-2xl">
          <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">אין פגישות</p>
        </div>
      ) : (
        <div className="bg-surface-0 rounded-2xl border border-surface-2 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-1 border-b border-surface-2">
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>תאריך</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>שעה</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">מומחה</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>משתמש</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">תפקיד</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">כיתה</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>משתתפים</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                    <div className="flex items-center gap-1">
                      <BookOpen size={14} />
                      <span>נושא</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">נוצר</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-surface-2 last:border-0 hover:bg-surface-1/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm">
                      {formatHebrewDate(booking.date)}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">
                      {booking.startTime}-{booking.endTime}
                    </td>
                    <td className="px-4 py-3 text-sm">{expertNameMap[booking.expertId] || booking.expertId}</td>
                    <td className="px-4 py-3 text-sm font-medium">{booking.userName}</td>
                    <td className="px-4 py-3 text-sm">{ROLE_LABELS[booking.userRole]}</td>
                    <td className="px-4 py-3 text-sm">{booking.userGrade || "-"}</td>
                    <td className="px-4 py-3 text-sm max-w-[150px] truncate" title={booking.participants}>
                      {booking.participants || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm max-w-[200px] truncate" title={booking.topic}>
                      {booking.topic}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {booking.createdAt.toLocaleDateString("he-IL")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setDeleteConfirm(booking)}
                        className="p-1.5 text-gray-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
                        title="מחק פגישה"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="מחיקת פגישה"
        message={`האם למחוק את הפגישה של ${deleteConfirm?.userName} ב-${deleteConfirm?.date} ${deleteConfirm?.startTime}?`}
        confirmLabel="מחק"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
