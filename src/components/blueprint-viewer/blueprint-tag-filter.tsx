"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Tag } from "@/types/database";

interface BlueprintTagFilterProps {
  tags: Tag[];
  onTagFilter?: (tagId: string | null) => void;
}

export function BlueprintTagFilter({ tags, onTagFilter }: BlueprintTagFilterProps) {
  const [activeTagId, setActiveTagId] = useState<string | null>(null);

  if (tags.length === 0) return null;

  function handleToggle(tagId: string) {
    const newId = activeTagId === tagId ? null : tagId;
    setActiveTagId(newId);
    onTagFilter?.(newId);
  }

  return (
    <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b bg-card px-4 py-2 scrollbar-none">
      {tags.map((tag) => {
        const isActive = tag.id === activeTagId;
        return (
          <button
            key={tag.id}
            onClick={() => handleToggle(tag.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "border bg-background text-foreground hover:bg-accent"
            )}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: isActive ? "currentColor" : (tag.color ?? "#6b7280"),
              }}
            />
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}
