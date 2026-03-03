"use client";

import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCanvasStore } from "@/stores/canvas-store";

export function ZoomControls() {
  const { zoom, panX, panY, setZoom, setPan } = useCanvasStore();

  function zoomBy(factor: number) {
    const newZoom = zoom * factor;
    // Zoom toward center of the viewport — requires knowing container size,
    // but we can compute from the parent. For simplicity, zoom toward the
    // current center by adjusting pan proportionally.
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const newPanX = cx - (cx - panX) * (newZoom / zoom);
    const newPanY = cy - (cy - panY) * (newZoom / zoom);
    setZoom(newZoom);
    setPan(newPanX, newPanY);
  }

  return (
    <div className="absolute bottom-4 left-4 flex flex-col gap-0 rounded-xl bg-card p-1 shadow-lg ring-1 ring-border/50">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={() => zoomBy(1.25)}
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Separator />
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={() => zoomBy(1 / 1.25)}
      >
        <Minus className="h-4 w-4" />
      </Button>
    </div>
  );
}
