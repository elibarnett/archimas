"use client";

import { Layer } from "react-konva";
import { PinMarker } from "./pin-marker";
import { useCanvasStore } from "@/stores/canvas-store";
import type { PinWithTags } from "@/types/database";

interface PinLayerProps {
  pins: PinWithTags[];
  imageWidth: number;
  imageHeight: number;
  filterTagId?: string | null;
}

export function PinLayer({
  pins,
  imageWidth,
  imageHeight,
  filterTagId,
}: PinLayerProps) {
  const selectedPinId = useCanvasStore((s) => s.selectedPinId);
  const setSelectedPinId = useCanvasStore((s) => s.setSelectedPinId);

  // Filter by tag if active
  const filtered = filterTagId
    ? pins.filter((p) => p.tags.some((t) => t.id === filterTagId))
    : pins;

  // Render selected pin last so it appears on top
  const sorted = [...filtered].sort((a, b) => {
    if (a.id === selectedPinId) return 1;
    if (b.id === selectedPinId) return -1;
    return 0;
  });

  return (
    <Layer listening>
      {sorted.map((pin) => (
        <PinMarker
          key={pin.id}
          pin={pin}
          imageWidth={imageWidth}
          imageHeight={imageHeight}
          isSelected={pin.id === selectedPinId}
          onSelect={setSelectedPinId}
        />
      ))}
    </Layer>
  );
}
