"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tag } from "@/types/database";

interface TagMultiSelectProps {
  tags: Tag[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

export function TagMultiSelect({
  tags,
  selected,
  onChange,
}: TagMultiSelectProps) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => {
        const isActive = selected.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggle(tag.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
              isActive
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-accent"
            )}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: tag.color ?? "#6b7280" }}
            />
            {tag.name}
            {isActive && <Check className="h-3 w-3" />}
          </button>
        );
      })}
    </div>
  );
}
