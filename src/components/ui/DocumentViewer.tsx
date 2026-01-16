"use client";

import { useState, useEffect, useRef } from "react";
import { Download, FileText, Loader2, RefreshCw } from "lucide-react";
import { Button } from "./Button";

interface DocumentViewerProps {
  url: string;
  fileName: string;
  className?: string;
}

const LOAD_TIMEOUT = 15000; // 15 seconds timeout for loading

/**
 * Embeds PDF and Word documents using Google Docs Viewer.
 * Supports: .pdf, .doc, .docx
 */
export function DocumentViewer({ url, fileName, className = "" }: DocumentViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Google Docs Viewer URL - works for PDF, DOC, DOCX
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

  // Timeout for loading - Google Docs Viewer doesn't always trigger onerror
  useEffect(() => {
    if (loading && !error) {
      timeoutRef.current = setTimeout(() => {
        setLoading(false);
        setError(true);
      }, LOAD_TIMEOUT);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loading, error, iframeKey]);

  const handleLoad = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setLoading(false);
    setError(true);
  };

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    // Force iframe reload by updating key (React-based approach)
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className={`relative bg-surface-1 rounded-xl overflow-hidden ${className}`}>
      {/* Download button - fixed top left */}
      <a
        href={url}
        download={fileName}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg shadow-lg hover:bg-primary/90 transition-colors text-sm font-medium"
      >
        <Download size={16} />
        הורדה
      </a>

      {/* Loading state */}
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-1 z-[5]">
          <Loader2 size={40} className="text-primary animate-spin mb-3" />
          <p className="text-gray-500 text-sm">טוען מסמך...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-1 z-[5]">
          <FileText size={48} className="text-gray-400 mb-3" />
          <p className="text-gray-500 mb-4">לא הצלחנו לטעון את המסמך</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRetry} rightIcon={RefreshCw}>
              נסה שוב
            </Button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Download size={16} />
              הורד קובץ
            </a>
          </div>
        </div>
      )}

      {/* Document viewer iframe */}
      <iframe
        key={iframeKey}
        src={viewerUrl}
        className="w-full h-full border-0"
        onLoad={handleLoad}
        onError={handleError}
        title={fileName}
        style={{ minHeight: "70vh" }}
      />
    </div>
  );
}
