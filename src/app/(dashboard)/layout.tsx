"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, notFound } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { VisibilityProvider } from "@/contexts/VisibilityContext";
import { ToastProvider } from "@/components/ui/Toast";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Skeleton } from "@/components/ui/Skeleton";
import { Icon } from "@/components/ui/Icon";
import { X } from "lucide-react";
import type { UserRole } from "@/types";

const VALID_ROLES: UserRole[] = ["admin", "teacher", "parent", "student"];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Extract role from pathname (e.g., /admin/settings -> admin)
  const urlRole = pathname.split("/")[1];
  const isValidRole = VALID_ROLES.includes(urlRole as UserRole);

  useEffect(() => {
    // Don't redirect if role is invalid - let notFound() handle it
    if (!isValidRole) return;

    if (!loading && !session) {
      router.push("/");
    }
  }, [session, loading, router, isValidRole]);

  // Invalid role - show 404
  if (!isValidRole) {
    notFound();
  }

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [children]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-2xl bg-primary/10 animate-pulse">
            <Icon name="atom" size="xl" className="text-primary" />
          </div>
          <div className="space-y-2 text-center">
            <Skeleton variant="text" width={120} />
            <p className="text-sm text-gray-400">טוען את המערכת...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <ThemeProvider>
      <VisibilityProvider>
        <ToastProvider>
          <div className="h-screen bg-background flex overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <Sidebar />
          </div>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/50 animate-fade-in"
                onClick={() => setSidebarOpen(false)}
              />

              {/* Sidebar */}
              <div className="absolute top-0 right-0 h-full animate-slide-in-right">
                <div className="relative">
                  <Sidebar onClose={() => setSidebarOpen(false)} />

                  {/* Close button */}
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="absolute top-4 left-4 p-2 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors cursor-pointer"
                    aria-label="סגור תפריט"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
            <Header onMenuToggle={() => setSidebarOpen(true)} />
            <main className="flex-1 p-4 md:p-6 overflow-y-auto overflow-x-hidden">
              <div className="animate-fade-in">{children}</div>
            </main>
          </div>
          </div>
        </ToastProvider>
      </VisibilityProvider>
    </ThemeProvider>
  );
}
