"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { RefreshCw } from "lucide-react";
import packageJson from "../../package.json";

const VERSION_KEY = "app_version";
const CURRENT_VERSION = packageJson.version;

export function VersionGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking" | "updating" | "ready">("checking");
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    const checkVersion = async (isInitialLoad: boolean) => {
      const storedVersion = localStorage.getItem(VERSION_KEY);

      // First visit - store version and proceed
      if (!storedVersion) {
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
        setStatus("ready");
        return;
      }

      // Same version - proceed normally
      if (storedVersion === CURRENT_VERSION) {
        setStatus("ready");
        return;
      }

      // Version changed - clear caches and reload
      console.log(`Version changed: ${storedVersion} → ${CURRENT_VERSION}`);
      setStatus("updating");

      try {
        // Unregister all service workers
        if ("serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(
            registrations.map((registration) => registration.unregister())
          );
        }

        // Clear all caches from Cache Storage API
        if ("caches" in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName))
          );
        }

        // Update stored version
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION);

        // Small delay to show the update message, then reload
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        console.error("Error clearing caches:", error);
        // Even if cache clearing fails, update version and proceed
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
        setStatus("ready");
      }
    };

    // Check on initial load and on every route change
    if (isFirstRender.current) {
      isFirstRender.current = false;
      checkVersion(true);
    } else {
      // On route change, only show updating screen if version mismatch
      const storedVersion = localStorage.getItem(VERSION_KEY);
      if (storedVersion && storedVersion !== CURRENT_VERSION) {
        checkVersion(false);
      }
    }
  }, [pathname]);

  // Show loading screen while checking or updating
  if (status !== "ready") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-50 to-teal-50">
        <div className="text-center">
          {/* Animated icon */}
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"
              style={{ animationDuration: "1s" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-primary animate-pulse" />
            </div>
          </div>

          <h2 className="text-lg font-semibold text-foreground mb-2">
            {status === "checking" ? "טוען..." : "מעדכן גרסה חדשה..."}
          </h2>
          {status === "updating" && (
            <p className="text-sm text-gray-500">
              מנקה קבצים ישנים וטוען גרסה {CURRENT_VERSION}
            </p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
