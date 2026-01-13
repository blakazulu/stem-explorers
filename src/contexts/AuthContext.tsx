"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { User, AuthSession, UserRole } from "@/types";

interface AuthContextType {
  session: AuthSession | null;
  loading: boolean;
  login: (name: string, password: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session on mount and validate it
    const validateSession = async () => {
      const stored = localStorage.getItem("stem-session");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as AuthSession;
          // Validate session by checking if document still exists in Firestore
          const userDoc = await getDoc(doc(db, "users", parsed.documentId));
          if (userDoc.exists()) {
            setSession(parsed);
          } else {
            // Document no longer exists, clear invalid session
            localStorage.removeItem("stem-session");
          }
        } catch {
          localStorage.removeItem("stem-session");
        }
      }
      setLoading(false);
    };
    validateSession();
  }, []);

  const login = async (name: string, password: string) => {
    try {
      // Sanitize name: trim whitespace and limit to 100 characters
      const sanitizedName = name.trim().slice(0, 100);

      const userDoc = await getDoc(doc(db, "users", password));

      if (!userDoc.exists()) {
        return { success: false, error: "סיסמה שגויה" };
      }

      const userData = userDoc.data() as Omit<User, "createdAt"> & { createdAt: { toDate: () => Date } };
      const user: User = {
        ...userData,
        name: sanitizedName,
        createdAt: userData.createdAt?.toDate() || new Date(),
      };

      // Store documentId (which is the password/doc ID) instead of raw password
      const newSession: AuthSession = { user, documentId: password };
      setSession(newSession);
      localStorage.setItem("stem-session", JSON.stringify(newSession));

      return { success: true, role: user.role };
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
