"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { session } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-rubik font-bold mb-6">לוח בקרה</h1>
      <p className="text-gray-600">
        ברוך הבא, {session?.user.name}! בחר באחת האפשרויות מהתפריט.
      </p>
    </div>
  );
}
