"use client";

import { Play } from "lucide-react";
import { getSupabaseFileUrl } from "@/lib/utils";
import { STORAGE_BUCKETS } from "@/lib/constants";
import type { DocumentWithTags } from "@/types/database";

interface DocumentGalleryProps {
  documents: DocumentWithTags[];
  onDocumentTap: (doc: DocumentWithTags) => void;
}

export function DocumentGallery({
  documents,
  onDocumentTap,
}: DocumentGalleryProps) {
  if (documents.length === 0) return null;

  // Sort by captured_at desc, fallback to created_at
  const sorted = [...documents].sort((a, b) => {
    const dateA = a.captured_at ?? a.created_at;
    const dateB = b.captured_at ?? b.created_at;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return (
    <div className="grid grid-cols-3 gap-1">
      {sorted.map((doc) => {
        const thumbUrl = getSupabaseFileUrl(
          STORAGE_BUCKETS.DOCUMENTS,
          doc.thumbnail_path ?? doc.file_path
        );
        const isVideo = doc.mime_type?.startsWith("video/");

        return (
          <button
            key={doc.id}
            className="relative aspect-square overflow-hidden rounded-md bg-muted"
            onClick={() => onDocumentTap(doc)}
          >
            <img
              src={thumbUrl}
              alt={doc.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            {isVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50">
                  <Play className="h-4 w-4 fill-white text-white" />
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
