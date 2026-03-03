"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tag } from "@/types/database";

interface BlueprintTagFilterProps {
  tags: Tag[];
  onTagFilter?: (tagIds: string[]) => void;
}

export function BlueprintTagFilter({ tags, onTagFilter }: BlueprintTagFilterProps) {
  const [activeTagIds, setActiveTagIds] = useState<string[]>([]);

  if (tags.length === 0) return null;

  function handleToggle(tagId: string) {
    const next = activeTagIds.includes(tagId)
      ? activeTagIds.filter((id) => id !== tagId)
      : [...activeTagIds, tagId];
    setActiveTagIds(next);
    onTagFilter?.(next);
  }

  return (
    <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b bg-card px-4 py-2 scrollbar-none">
      {tags.map((tag) => {
        const isActive = activeTagIds.includes(tag.id);
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
            {isActive ? (
              <Check className="h-3 w-3" />
            ) : (
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: tag.color ?? "#6b7280" }}
              />
            )}
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}
