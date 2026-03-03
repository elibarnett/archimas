"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { BlueprintViewerHeader } from "./blueprint-viewer-header";
import { BlueprintTagFilter } from "./blueprint-tag-filter";
import { BlueprintCanvas } from "./blueprint-canvas";
import { ZoomControls } from "./zoom-controls";
import { BlueprintBottomNav } from "./blueprint-bottom-nav";
import { PinPlacementOverlay } from "./pin-placement-overlay";
import { PinCreationForm } from "./pin-creation-form";
import { PinDetailPanel } from "./pin-detail-panel";
import { DocumentUploadDialog } from "./document-upload-dialog";
import { useCanvasStore } from "@/stores/canvas-store";
import { getSupabaseFileUrl } from "@/lib/utils";
import { STORAGE_BUCKETS } from "@/lib/constants";
import type { Tag, PinWithTags, DocumentWithTags } from "@/types/database";

interface BlueprintViewerShellProps {
  blueprint: {
    id: string;
    name: string;
    file_path: string;
    width: number | null;
    height: number | null;
    floor: string | null;
    updated_at: string;
  };
  project: {
    name: string;
  };
  projectId: string;
  tags: Tag[];
  pins: PinWithTags[];
}

export function BlueprintViewerShell({
  blueprint,
  project,
  projectId,
  tags,
  pins,
}: BlueprintViewerShellProps) {
  const router = useRouter();
  const { setOpen } = useSidebar();
  const resetViewport = useCanvasStore((s) => s.resetViewport);
  const setActiveTool = useCanvasStore((s) => s.setActiveTool);
  const selectedPinId = useCanvasStore((s) => s.selectedPinId);
  const setSelectedPinId = useCanvasStore((s) => s.setSelectedPinId);

  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(
    null
  );
  const [pinDocuments, setPinDocuments] = useState<DocumentWithTags[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [docRefreshKey, setDocRefreshKey] = useState(0);
  const [filterTagIds, setFilterTagIds] = useState<string[]>([]);

  const selectedPin = useMemo(
    () => pins.find((p) => p.id === selectedPinId) ?? null,
    [pins, selectedPinId]
  );

  // Fetch documents when a pin is selected
  useEffect(() => {
    if (!selectedPinId) {
      setPinDocuments([]);
      return;
    }

    let cancelled = false;

    async function fetchDocuments() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data } = await supabase
        .from("documents")
        .select("*, document_tags(tags(*))")
        .eq("pin_id", selectedPinId)
        .order("created_at", { ascending: false });

      if (cancelled || !data) return;

      const docs: DocumentWithTags[] = data.map(
        (doc: Record<string, unknown>) => {
          const docTags =
            (doc.document_tags as { tags: Tag }[] | undefined) ?? [];
          const { document_tags: _, ...docData } = doc;
          return {
            ...docData,
            tags: docTags.map((dt) => dt.tags),
          } as DocumentWithTags;
        }
      );
      setPinDocuments(docs);
    }

    fetchDocuments();
    return () => {
      cancelled = true;
    };
  }, [selectedPinId, docRefreshKey]);

  // Auto-collapse sidebar when entering the viewer
  useEffect(() => {
    setOpen(false);
    return () => {
      resetViewport();
      setActiveTool("select");
    };
  }, [setOpen, resetViewport, setActiveTool]);

  const imageUrl = getSupabaseFileUrl(
    STORAGE_BUCKETS.BLUEPRINTS,
    blueprint.file_path
  );

  function handlePinPlace(pos: { x: number; y: number }) {
    setPendingPin(pos);
  }

  function handlePinCreated() {
    setPendingPin(null);
    setActiveTool("select");
    router.refresh();
  }

  function handlePinFormClose(open: boolean) {
    if (!open) {
      setPendingPin(null);
    }
  }

  function handlePinDetailClose(open: boolean) {
    if (!open) {
      setSelectedPinId(null);
    }
  }

  function handlePinDeleted() {
    setSelectedPinId(null);
    router.refresh();
  }

  function handleAddDocument() {
    setShowUploadDialog(true);
  }

  function handleDocumentUploaded() {
    setDocRefreshKey((k) => k + 1);
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-[#f6f6f8]">
      <BlueprintViewerHeader
        projectId={projectId}
        projectName={project.name}
        blueprintName={blueprint.name}
        floor={blueprint.floor}
        updatedAt={blueprint.updated_at}
      />

      <BlueprintTagFilter tags={tags} onTagFilter={setFilterTagIds} />

      {/* Canvas */}
      <div className="relative flex-1 overflow-hidden">
        <BlueprintCanvas
          imageUrl={imageUrl}
          width={blueprint.width}
          height={blueprint.height}
          pins={pins}
          filterTagIds={filterTagIds}
          onPinPlace={handlePinPlace}
        />

        {/* Floating controls */}
        <PinPlacementOverlay />
        <ZoomControls />
      </div>

      <BlueprintBottomNav />

      {/* Pin creation sheet */}
      {pendingPin && (
        <PinCreationForm
          blueprintId={blueprint.id}
          position={pendingPin}
          open={!!pendingPin}
          onOpenChange={handlePinFormClose}
          onCreated={handlePinCreated}
        />
      )}

      {/* Pin detail panel */}
      {selectedPin && (
        <PinDetailPanel
          pin={selectedPin}
          documents={pinDocuments}
          tags={tags}
          projectId={projectId}
          open={!!selectedPin}
          onOpenChange={handlePinDetailClose}
          onPinDeleted={handlePinDeleted}
          onAddDocument={handleAddDocument}
          onDocumentDeleted={handleDocumentUploaded}
        />
      )}

      {/* Document upload dialog */}
      {selectedPinId && (
        <DocumentUploadDialog
          pinId={selectedPinId}
          projectId={projectId}
          tags={tags}
          open={showUploadDialog}
          onOpenChange={setShowUploadDialog}
          onUploaded={handleDocumentUploaded}
        />
      )}
    </div>
  );
}
