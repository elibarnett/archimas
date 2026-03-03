"use client";

import { useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { BlueprintViewerHeader } from "./blueprint-viewer-header";
import { BlueprintTagFilter } from "./blueprint-tag-filter";
import { BlueprintCanvas } from "./blueprint-canvas";
import { ZoomControls } from "./zoom-controls";
import { BlueprintBottomNav } from "./blueprint-bottom-nav";
import { useCanvasStore } from "@/stores/canvas-store";
import { getSupabaseFileUrl } from "@/lib/utils";
import { STORAGE_BUCKETS } from "@/lib/constants";
import type { Tag } from "@/types/database";

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
}

export function BlueprintViewerShell({
  blueprint,
  project,
  projectId,
  tags,
}: BlueprintViewerShellProps) {
  const { setOpen } = useSidebar();
  const resetViewport = useCanvasStore((s) => s.resetViewport);

  // Auto-collapse sidebar when entering the viewer
  useEffect(() => {
    setOpen(false);
    return () => {
      resetViewport();
    };
  }, [setOpen, resetViewport]);

  const imageUrl = getSupabaseFileUrl(
    STORAGE_BUCKETS.BLUEPRINTS,
    blueprint.file_path
  );

  return (
    <div className="flex h-[100dvh] flex-col bg-[#f6f6f8]">
      <BlueprintViewerHeader
        projectId={projectId}
        projectName={project.name}
        blueprintName={blueprint.name}
        floor={blueprint.floor}
        updatedAt={blueprint.updated_at}
      />

      <BlueprintTagFilter tags={tags} />

      {/* Canvas */}
      <div className="relative flex-1 overflow-hidden">
        <BlueprintCanvas
          imageUrl={imageUrl}
          width={blueprint.width}
          height={blueprint.height}
        />

        {/* Floating controls */}
        <ZoomControls />
      </div>

      <BlueprintBottomNav />
    </div>
  );
}
