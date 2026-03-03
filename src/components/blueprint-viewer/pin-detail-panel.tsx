"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  StickyNote,
  AlertTriangle,
  Camera,
  Ruler,
  ShieldAlert,
  MoreVertical,
  Trash2,
  Plus,
} from "lucide-react";
import { DocumentGallery } from "./document-gallery";
import { DocumentPreviewDialog } from "./document-preview-dialog";
import { PIN_TYPE_CONFIG } from "@/lib/constants";
import { deletePin } from "@/lib/actions/pin-actions";
import { getRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import type { PinWithTags, DocumentWithTags, Tag } from "@/types/database";
import type { PinType } from "@/types/database";
import type { LucideIcon } from "lucide-react";

const PIN_TYPE_ICONS: Record<PinType, LucideIcon> = {
  note: StickyNote,
  issue: AlertTriangle,
  photo: Camera,
  measurement: Ruler,
  safety: ShieldAlert,
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

interface PinDetailPanelProps {
  pin: PinWithTags;
  documents: DocumentWithTags[];
  tags: Tag[];
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPinDeleted: () => void;
  onAddDocument: () => void;
  onDocumentDeleted?: () => void;
}

export function PinDetailPanel({
  pin,
  documents,
  open,
  onOpenChange,
  onPinDeleted,
  onAddDocument,
  onDocumentDeleted,
}: PinDetailPanelProps) {
  const [deleting, setDeleting] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentWithTags | null>(null);

  const Icon = PIN_TYPE_ICONS[pin.pin_type];
  const config = PIN_TYPE_CONFIG[pin.pin_type];

  async function handleDelete() {
    setDeleting(true);
    try {
      const result = await deletePin(pin.id);
      if (result.success) {
        toast.success("Pin deleted");
        onPinDeleted();
      } else {
        toast.error(result.error);
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader className="flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: config.color + "20" }}
              >
                <Icon className="h-4 w-4" style={{ color: config.color }} />
              </div>
              <SheetTitle className="text-base">
                {pin.label || config.label}
              </SheetTitle>
              <SheetDescription className="sr-only">
                Pin details and documents
              </SheetDescription>
              <Badge variant="secondary" className="text-[10px]">
                {STATUS_LABELS[pin.status] ?? pin.status}
              </Badge>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Pin
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SheetHeader>

          <div className="flex flex-col gap-4 px-4 pb-4">
            {/* Description */}
            {pin.description ? (
              <p className="text-sm text-muted-foreground">{pin.description}</p>
            ) : (
              <p className="text-sm italic text-muted-foreground/60">
                No description
              </p>
            )}

            {/* Tags */}
            {pin.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {pin.tags.map((tag) => (
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

            {/* Documents section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">
                  Photos & Documents
                  {documents.length > 0 && (
                    <span className="ml-1 text-muted-foreground">
                      ({documents.length})
                    </span>
                  )}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={onAddDocument}
                >
                  <Plus className="h-3 w-3" />
                  Add
                </Button>
              </div>

              {documents.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground/60">
                  No documents yet. Tap + to add photos or videos.
                </p>
              ) : (
                <DocumentGallery
                  documents={documents}
                  onDocumentTap={setPreviewDoc}
                />
              )}
            </div>

            {/* Metadata */}
            <p className="text-xs text-muted-foreground">
              Created {getRelativeTime(pin.created_at)}
            </p>
          </div>
        </SheetContent>
      </Sheet>

      {/* Document preview */}
      <DocumentPreviewDialog
        document={previewDoc}
        open={!!previewDoc}
        onOpenChange={(o) => { if (!o) setPreviewDoc(null); }}
        onDeleted={() => {
          setPreviewDoc(null);
          onDocumentDeleted?.();
        }}
      />
    </>
  );
}
