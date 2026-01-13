"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

const roleLabels: Record<string, string> = {
  admin: "מנהל",
  teacher: "מורה",
  parent: "הורה",
  student: "תלמיד",
};

export function Header() {
  const { session, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-gray-600">שלום, </span>
          <span className="font-medium">{session?.user.name}</span>
          <span className="text-gray-400 mx-2">|</span>
          <span className="text-sm text-gray-500">
            {session?.user.role && roleLabels[session.user.role]}
            {session?.user.grade && ` - כיתה ${session.user.grade}`}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          התנתק
        </Button>
      </div>
    </header>
  );
}
