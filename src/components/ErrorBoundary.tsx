"use client";

import { Component, ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="max-w-md mx-auto mt-8">
          <div className="flex flex-col items-center text-center gap-4 py-6">
            <div className="p-3 bg-error/10 rounded-full">
              <AlertTriangle size={32} className="text-error" />
            </div>
            <div>
              <h2 className="text-lg font-rubik font-bold text-foreground mb-2">
                משהו השתבש
              </h2>
              <p className="text-sm text-gray-500">
                אירעה שגיאה בלתי צפויה. נסה לרענן את הדף.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={this.handleReset}
              leftIcon={RefreshCw}
            >
              נסה שוב
            </Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}
