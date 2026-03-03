"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { getSupabaseFileUrl, formatFileSize, getRelativeTime } from "@/lib/utils";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { deleteDocument } from "@/lib/actions/document-actions";
import { toast } from "sonner";
import type { DocumentWithTags } from "@/types/database";

interface DocumentPreviewDialogProps {
  document: DocumentWithTags | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function DocumentPreviewDialog({
  document: doc,
  open,
  onOpenChange,
  onDeleted,
}: DocumentPreviewDialogProps) {
  const [deleting, setDeleting] = useState(false);

  if (!doc) return null;

  const fileUrl = getSupabaseFileUrl(STORAGE_BUCKETS.DOCUMENTS, doc.file_path);
  const isVideo = doc.mime_type?.startsWith("video/");
  const isImage = doc.mime_type?.startsWith("image/");

  async function handleDelete() {
    if (!doc) return;
    setDeleting(true);
    try {
      const result = await deleteDocument(doc.id);
      if (result.success) {
        toast.success("Document deleted");
        onDeleted();
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] max-w-3xl overflow-y-auto p-0">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle className="text-base">{doc.name}</DialogTitle>
        </DialogHeader>

        {/* Media */}
        <div className="flex items-center justify-center bg-muted">
          {isImage && (
            <img
              src={fileUrl}
              alt={doc.name}
              className="max-h-[60vh] w-full object-contain"
            />
          )}
          {isVideo && (
            <video
              src={fileUrl}
              controls
              className="max-h-[60vh] w-full"
              playsInline
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 p-4">
          {doc.description && (
            <p className="text-sm text-muted-foreground">{doc.description}</p>
          )}

          {doc.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {doc.tags.map((tag) => (
                <Badge key={tag.id} variant="outline" className="text-xs">
                  <span
                    className="mr-1.5 inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: tag.color ?? "#6b7280" }}
                  />
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {doc.captured_at
                ? getRelativeTime(doc.captured_at)
                : getRelativeTime(doc.created_at)}{" "}
              · {formatFileSize(doc.file_size ?? 0)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
