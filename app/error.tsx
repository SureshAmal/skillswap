"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <div className="h-20 w-20 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold mb-3">Oops! Something went wrong</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        We encountered an unexpected error. Please try again or return to the
        home page.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset} variant="outline">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Try again
        </Button>
        <Button onClick={() => (window.location.href = "/")}>
          <Home className="mr-2 h-4 w-4" />
          Go Home
        </Button>
      </div>
    </div>
  );
}
