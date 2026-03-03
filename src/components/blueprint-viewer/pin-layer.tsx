"use client";

import { Layer } from "react-konva";
import { PinMarker } from "./pin-marker";
import { useCanvasStore } from "@/stores/canvas-store";
import type { PinWithTags } from "@/types/database";

interface PinLayerProps {
  pins: PinWithTags[];
  imageWidth: number;
  imageHeight: number;
  filterTagIds?: string[];
}

export function PinLayer({
  pins,
  imageWidth,
  imageHeight,
  filterTagIds,
}: PinLayerProps) {
  const selectedPinId = useCanvasStore((s) => s.selectedPinId);
  const setSelectedPinId = useCanvasStore((s) => s.setSelectedPinId);

  const hasActiveFilter = filterTagIds && filterTagIds.length > 0;

  // Render selected pin last so it appears on top
  const sorted = [...pins].sort((a, b) => {
    if (a.id === selectedPinId) return 1;
    if (b.id === selectedPinId) return -1;
    return 0;
  });

  return (
    <Layer listening>
      {sorted.map((pin) => {
        const matchesFilter = hasActiveFilter
          ? pin.tags.some((t) => filterTagIds.includes(t.id))
          : true;

        return (
          <PinMarker
            key={pin.id}
            pin={pin}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            isSelected={pin.id === selectedPinId}
            onSelect={setSelectedPinId}
            opacity={hasActiveFilter && !matchesFilter ? 0.2 : 1}
          />
        );
      })}
    </Layer>
  );
}
