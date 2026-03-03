"use client";

import { Check, X, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "./date-range-picker";
import { useFilterSearchParams } from "@/hooks/use-filter-search-params";
import { hasActiveFilters } from "@/lib/filters";
import { cn } from "@/lib/utils";
import type { Tag } from "@/types/database";
import type { SortOption } from "@/lib/filters";

interface FilterBarProps {
  tags: Tag[];
  blueprints?: { id: string; name: string; floor: string | null }[];
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "captured_at", label: "Date Captured" },
  { value: "created_at", label: "Date Uploaded" },
  { value: "tag", label: "Grouped by Tag" },
];

export function FilterBar({ tags, blueprints }: FilterBarProps) {
  const { filters, setFilters, resetFilters } = useFilterSearchParams();

  function toggleTag(tagId: string) {
    const next = filters.tags.includes(tagId)
      ? filters.tags.filter((id) => id !== tagId)
      : [...filters.tags, tagId];
    setFilters({ tags: next });
  }

  return (
    <div className="sticky top-0 z-10 flex flex-col gap-2 border-b bg-card px-4 py-2">
      {/* Primary row: tags + date + sort */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
        {/* Tag pills */}
        {tags.map((tag) => {
          const isActive = filters.tags.includes(tag.id);
          return (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
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

        {/* Spacer */}
        {tags.length > 0 && <div className="h-4 w-px shrink-0 bg-border" />}

        {/* Date range */}
        <DateRangePicker
          from={filters.from}
          to={filters.to}
          onChange={(from, to) => setFilters({ from, to })}
        />

        {/* Sort */}
        <Select
          value={filters.sort}
          onValueChange={(val) => setFilters({ sort: val as SortOption })}
        >
          <SelectTrigger className="h-8 w-auto shrink-0 gap-1.5 rounded-full border px-3 text-xs [&>svg:last-child]:hidden">
            <ArrowUpDown className="h-3.5 w-3.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Blueprint filter (if blueprints provided) */}
        {blueprints && blueprints.length > 0 && (
          <Select
            value={filters.blueprintId ?? "all"}
            onValueChange={(val) =>
              setFilters({ blueprintId: val === "all" ? null : val, pinId: null })
            }
          >
            <SelectTrigger className="h-8 w-auto shrink-0 gap-1.5 rounded-full border px-3 text-xs [&>svg:last-child]:hidden">
              <SelectValue placeholder="All Blueprints" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Blueprints</SelectItem>
              {blueprints.map((bp) => (
                <SelectItem key={bp.id} value={bp.id}>
                  {bp.name}
                  {bp.floor ? ` (${bp.floor})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Clear */}
        {hasActiveFilters(filters) && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full"
            onClick={resetFilters}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
