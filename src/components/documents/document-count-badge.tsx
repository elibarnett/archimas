"use client";

interface DocumentCountBadgeProps {
  count: number;
}

export function DocumentCountBadge({ count }: DocumentCountBadgeProps) {
  return (
    <span className="text-sm text-muted-foreground">
      {count === 0
        ? "No documents"
        : count === 1
          ? "1 document"
          : `${count} documents`}
    </span>
  );
}
