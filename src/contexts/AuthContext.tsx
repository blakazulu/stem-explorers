"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { User, AuthSession, UserRole, Grade } from "@/types";

interface AuthContextType {
  session: AuthSession | null;
  loading: boolean;
  login: (name: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session on mount
    const stored = localStorage.getItem("stem-session");
    if (stored) {
      try {
        setSession(JSON.parse(stored));
      } catch {
        localStorage.removeItem("stem-session");
      }
    }
    setLoading(false);
  }, []);

  const login = async (name: string, password: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", password));

      if (!userDoc.exists()) {
        return { success: false, error: "סיסמה שגויה" };
      }

      const userData = userDoc.data() as Omit<User, "createdAt"> & { createdAt: { toDate: () => Date } };
      const user: User = {
        ...userData,
        name,
        createdAt: userData.createdAt?.toDate() || new Date(),
      };

      const newSession: AuthSession = { user, password };
      setSession(newSession);
      localStorage.setItem("stem-session", JSON.stringify(newSession));

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "שגיאה בהתחברות" };
    }
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem("stem-session");
  };

  return (
    <AuthContext.Provider value={{ session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
