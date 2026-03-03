"use client";

import { getSupabaseFileUrl, formatDateShort, getRelativeTime } from "@/lib/utils";
import { STORAGE_BUCKETS } from "@/lib/constants";
import type { DocumentWithTags } from "@/types/database";

interface DocumentTimelineViewProps {
  documents: DocumentWithTags[];
  onDocumentTap: (doc: DocumentWithTags) => void;
}

function groupByDate(docs: DocumentWithTags[]) {
  const groups = new Map<string, DocumentWithTags[]>();

  for (const doc of docs) {
    const dateStr = doc.captured_at ?? doc.created_at;
    const key = new Date(dateStr).toISOString().split("T")[0];
    const existing = groups.get(key);
    if (existing) {
      existing.push(doc);
    } else {
      groups.set(key, [doc]);
    }
  }

  // Sort groups by date descending
  return [...groups.entries()].sort(
    (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
  );
}

function formatGroupDate(isoDate: string): string {
  const date = new Date(isoDate + "T00:00:00");
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (isoDate === today) return "Today";
  if (isoDate === yesterdayStr) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function DocumentTimelineView({
  documents,
  onDocumentTap,
}: DocumentTimelineViewProps) {
  if (documents.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No documents match the current filters.
      </p>
    );
  }

  const groups = groupByDate(documents);

  return (
    <div className="relative pl-6">
      {/* Vertical timeline line */}
      <div className="absolute bottom-0 left-2 top-0 w-0.5 bg-border" />

      {groups.map(([dateKey, docs]) => (
        <div key={dateKey} className="relative mb-6">
          {/* Date dot */}
          <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-border bg-background">
            <div className="h-2 w-2 rounded-full bg-primary" />
          </div>

          {/* Date header */}
          <h3 className="sticky top-0 z-10 mb-2 bg-background/95 pb-1 text-sm font-semibold backdrop-blur-sm">
            {formatGroupDate(dateKey)}
          </h3>

          {/* Documents */}
          <div className="flex flex-col gap-2">
            {docs.map((doc) => {
              const thumbUrl = getSupabaseFileUrl(
                STORAGE_BUCKETS.DOCUMENTS,
                doc.thumbnail_path ?? doc.file_path
              );

              return (
                <button
                  key={doc.id}
                  className="flex items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent"
                  onClick={() => onDocumentTap(doc)}
                >
                  <img
                    src={thumbUrl}
                    alt={doc.name}
                    className="h-12 w-12 shrink-0 rounded-md bg-muted object-cover"
                    loading="lazy"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">
                      {doc.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {getRelativeTime(doc.captured_at ?? doc.created_at)}
                      </span>
                      {doc.tags.length > 0 && (
                        <div className="flex gap-0.5">
                          {doc.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag.id}
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: tag.color ?? "#6b7280" }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
