"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getAllUsers, createUser, deleteUser, UserDocument } from "@/lib/services/users";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { UserRole, Grade } from "@/types";

const roles: { value: UserRole; label: string }[] = [
  { value: "admin", label: "מנהל" },
  { value: "teacher", label: "מורה" },
  { value: "parent", label: "הורה" },
  { value: "student", label: "תלמיד" },
];

const grades: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

export default function PasswordsPage() {
  const { session } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deletePassword, setDeletePassword] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("teacher");
  const [newGrade, setNewGrade] = useState<Grade | null>("א");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      // Sort by role then by grade
      data.sort((a, b) => {
        const roleOrder = { admin: 0, teacher: 1, parent: 2, student: 3 };
        if (roleOrder[a.role] !== roleOrder[b.role]) {
          return roleOrder[a.role] - roleOrder[b.role];
        }
        return (a.grade || "").localeCompare(b.grade || "");
      });
      setUsers(data);
    } catch {
      setError("שגיאה בטעינת משתמשים");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (session?.user.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    loadUsers();
  }, [session, router, loadUsers]);

  function resetForm() {
    setNewPassword("");
    setNewRole("teacher");
    setNewGrade("א");
    setShowForm(false);
    setError(null);
  }

  async function handleCreate() {
    if (!newPassword.trim()) {
      setError("יש להזין סיסמה");
      return;
    }

    // Check if password already exists
    if (users.some((u) => u.password === newPassword.trim())) {
      setError("סיסמה זו כבר קיימת");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const grade = newRole === "admin" ? null : newGrade;
      await createUser(newPassword.trim(), newRole, grade);
      resetForm();
      await loadUsers();
    } catch {
      setError("שגיאה ביצירת משתמש");
    }

    setSaving(false);
  }

  async function handleDelete() {
    if (!deletePassword) return;

    // Prevent deleting the current admin
    if (deletePassword === session?.documentId) {
      setError("לא ניתן למחוק את המשתמש הנוכחי");
      setDeletePassword(null);
      return;
    }

    try {
      await deleteUser(deletePassword);
      setDeletePassword(null);
      await loadUsers();
    } catch {
      setError("שגיאה במחיקת משתמש");
    }
  }

  if (session?.user.role !== "admin") {
    return null;
  }

  // Group users by role
  const groupedUsers = {
    admin: users.filter((u) => u.role === "admin"),
    teacher: users.filter((u) => u.role === "teacher"),
    parent: users.filter((u) => u.role === "parent"),
    student: users.filter((u) => u.role === "student"),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-rubik font-bold">ניהול סיסמאות</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>סיסמה חדשה</Button>
        )}
      </div>

      {error && (
        <div className="bg-error/10 text-error p-4 rounded-lg">{error}</div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">יצירת סיסמה חדשה</h2>

          <div>
            <label className="block text-sm font-medium mb-1">סיסמה</label>
            <Input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="לדוגמה: teacher-a"
              dir="ltr"
            />
            <p className="text-xs text-gray-500 mt-1">
              מומלץ: teacher-X, parent-X, zzz-X (כאשר X = a-f לכיתות א-ו)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">תפקיד</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
              className="w-full p-2 border rounded-lg"
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {newRole !== "admin" && (
            <div>
              <label className="block text-sm font-medium mb-1">כיתה</label>
              <div className="flex gap-2">
                {grades.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setNewGrade(g)}
                    className={`w-10 h-10 rounded-lg font-bold ${
                      newGrade === g
                        ? "bg-primary text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? "יוצר..." : "צור סיסמה"}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              ביטול
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-gray-500">טוען משתמשים...</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedUsers).map(([role, roleUsers]) => (
            <div key={role} className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-700">
                {roles.find((r) => r.value === role)?.label} ({roleUsers.length})
              </h2>

              {roleUsers.length === 0 ? (
                <p className="text-sm text-gray-400">אין משתמשים</p>
              ) : (
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {roleUsers.map((user) => (
                    <div
                      key={user.password}
                      className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-between"
                    >
                      <div>
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {user.password}
                        </code>
                        {user.grade && (
                          <span className="mr-2 text-sm text-gray-500">
                            כיתה {user.grade}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setDeletePassword(user.password)}
                        className="text-sm text-error hover:underline"
                        disabled={user.password === session?.documentId}
                      >
                        {user.password === session?.documentId ? "(נוכחי)" : "מחק"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deletePassword !== null}
        title="מחיקת סיסמה"
        message={`האם אתה בטוח שברצונך למחוק את הסיסמה "${deletePassword}"? משתמשים עם סיסמה זו לא יוכלו להתחבר.`}
        confirmLabel="מחק"
        onConfirm={handleDelete}
        onCancel={() => setDeletePassword(null)}
      />
    </div>
  );
}
