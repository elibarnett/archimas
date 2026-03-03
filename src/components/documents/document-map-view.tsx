"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { BlueprintCanvas } from "@/components/blueprint-viewer/blueprint-canvas";
import { useCanvasStore } from "@/stores/canvas-store";
import { getSupabaseFileUrl } from "@/lib/utils";
import { STORAGE_BUCKETS } from "@/lib/constants";
import type { DocumentFilters } from "@/lib/filters";
import type { PinWithTags, Tag } from "@/types/database";

interface DocumentMapViewProps {
  blueprints: { id: string; name: string; floor: string | null }[];
  projectId: string;
  filters: DocumentFilters;
}

export function DocumentMapView({
  blueprints,
  projectId,
  filters,
}: DocumentMapViewProps) {
  const selectedBlueprintId = filters.blueprintId ?? blueprints[0]?.id ?? null;
  const [blueprint, setBlueprint] = useState<{
    file_path: string;
    width: number | null;
    height: number | null;
  } | null>(null);
  const [pins, setPins] = useState<PinWithTags[]>([]);
  const resetViewport = useCanvasStore((s) => s.resetViewport);

  // Fetch blueprint data and pins
  useEffect(() => {
    if (!selectedBlueprintId) return;

    let cancelled = false;

    async function fetchData() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const [bpRes, pinsRes] = await Promise.all([
        supabase
          .from("blueprints")
          .select("file_path, width, height")
          .eq("id", selectedBlueprintId)
          .single(),
        supabase
          .from("pins")
          .select("*, pin_tags(tags(*))")
          .eq("blueprint_id", selectedBlueprintId),
      ]);

      if (cancelled) return;

      if (bpRes.data) {
        setBlueprint(bpRes.data);
      }

      if (pinsRes.data) {
        const mappedPins: PinWithTags[] = pinsRes.data.map(
          (pin: Record<string, unknown>) => {
            const pinTags =
              (pin.pin_tags as { tags: Tag }[] | undefined) ?? [];
            const { pin_tags: _, ...pinData } = pin;
            return {
              ...pinData,
              tags: pinTags.map((pt) => pt.tags),
            } as PinWithTags;
          }
        );
        setPins(mappedPins);
      }
    }

    resetViewport();
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [selectedBlueprintId, resetViewport]);

  if (blueprints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MapPin className="mb-2 h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No blueprints in this project.
        </p>
      </div>
    );
  }

  if (!blueprint) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading blueprint...</p>
      </div>
    );
  }

  const imageUrl = getSupabaseFileUrl(
    STORAGE_BUCKETS.BLUEPRINTS,
    blueprint.file_path
  );

  return (
    <div className="h-[60vh] overflow-hidden rounded-lg border bg-muted">
      <BlueprintCanvas
        imageUrl={imageUrl}
        width={blueprint.width}
        height={blueprint.height}
        pins={pins}
        filterTagIds={filters.tags}
        readOnly
      />
    </div>
  );
}
