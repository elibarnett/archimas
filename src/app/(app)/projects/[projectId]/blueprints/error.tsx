"use client";

import { AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <EmptyState
        icon={AlertTriangle}
        title="Something went wrong"
        description={error.message}
      >
        <Button onClick={reset}>Try Again</Button>
      </EmptyState>
    </div>
  );
}
