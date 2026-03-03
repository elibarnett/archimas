"use client";

import { Play } from "lucide-react";
import { getSupabaseFileUrl, formatDateShort } from "@/lib/utils";
import { STORAGE_BUCKETS } from "@/lib/constants";
import type { DocumentWithTags, Tag } from "@/types/database";
import type { SortOption } from "@/lib/filters";

interface DocumentGridViewProps {
  documents: DocumentWithTags[];
  sort: SortOption;
  onDocumentTap: (doc: DocumentWithTags) => void;
}

function groupByTag(docs: DocumentWithTags[]) {
  const groups = new Map<string, { tag: Tag; docs: DocumentWithTags[] }>();
  const untagged: DocumentWithTags[] = [];

  for (const doc of docs) {
    if (doc.tags.length === 0) {
      untagged.push(doc);
    } else {
      for (const tag of doc.tags) {
        const existing = groups.get(tag.id);
        if (existing) {
          existing.docs.push(doc);
        } else {
          groups.set(tag.id, { tag, docs: [doc] });
        }
      }
    }
  }

  const sorted = [...groups.values()].sort((a, b) =>
    a.tag.name.localeCompare(b.tag.name)
  );

  return { groups: sorted, untagged };
}

function DocumentThumbnail({
  doc,
  onTap,
}: {
  doc: DocumentWithTags;
  onTap: () => void;
}) {
  const thumbUrl = getSupabaseFileUrl(
    STORAGE_BUCKETS.DOCUMENTS,
    doc.thumbnail_path ?? doc.file_path
  );
  const isVideo = doc.mime_type?.startsWith("video/");
  const dateStr = doc.captured_at ?? doc.created_at;

  return (
    <button
      className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
      onClick={onTap}
    >
      <img
        src={thumbUrl}
        alt={doc.name}
        className="h-full w-full object-cover transition-transform group-hover:scale-105"
        loading="lazy"
      />

      {/* Video play icon */}
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50">
            <Play className="h-4 w-4 fill-white text-white" />
          </div>
        </div>
      )}

      {/* Date overlay */}
      <span className="absolute right-1 top-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">
        {formatDateShort(dateStr)}
      </span>

      {/* Tag dots */}
      {doc.tags.length > 0 && (
        <div className="absolute bottom-1 left-1 flex gap-0.5">
          {doc.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="h-2 w-2 rounded-full border border-white/50"
              style={{ backgroundColor: tag.color ?? "#6b7280" }}
            />
          ))}
          {doc.tags.length > 3 && (
            <span className="text-[8px] font-bold text-white drop-shadow">
              +{doc.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </button>
  );
}

export function DocumentGridView({
  documents,
  sort,
  onDocumentTap,
}: DocumentGridViewProps) {
  if (documents.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No documents match the current filters.
      </p>
    );
  }

  // Grouped by tag mode
  if (sort === "tag") {
    const { groups, untagged } = groupByTag(documents);

    return (
      <div className="flex flex-col gap-6">
        {groups.map(({ tag, docs }) => (
          <div key={tag.id}>
            <div className="mb-2 flex items-center gap-2 px-1">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: tag.color ?? "#6b7280" }}
              />
              <h3 className="text-sm font-medium">{tag.name}</h3>
              <span className="text-xs text-muted-foreground">
                ({docs.length})
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4">
              {docs.map((doc) => (
                <DocumentThumbnail
                  key={doc.id}
                  doc={doc}
                  onTap={() => onDocumentTap(doc)}
                />
              ))}
            </div>
          </div>
        ))}
        {untagged.length > 0 && (
          <div>
            <div className="mb-2 px-1">
              <h3 className="text-sm font-medium text-muted-foreground">
                Untagged ({untagged.length})
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4">
              {untagged.map((doc) => (
                <DocumentThumbnail
                  key={doc.id}
                  doc={doc}
                  onTap={() => onDocumentTap(doc)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default: flat grid sorted by date
  return (
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4">
      {documents.map((doc) => (
        <DocumentThumbnail
          key={doc.id}
          doc={doc}
          onTap={() => onDocumentTap(doc)}
        />
      ))}
    </div>
  );
}
