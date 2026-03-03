"use client";

import { Plus, Minus, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCanvasStore } from "@/stores/canvas-store";

export function ZoomControls() {
  const { zoom, panX, panY, setZoom, setPan, resetViewport } =
    useCanvasStore();

  function zoomBy(factor: number) {
    const newZoom = zoom * factor;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const newPanX = cx - (cx - panX) * (newZoom / zoom);
    const newPanY = cy - (cy - panY) * (newZoom / zoom);
    setZoom(newZoom);
    setPan(newPanX, newPanY);
  }

  return (
    <div className="absolute bottom-4 left-4 flex flex-col items-center gap-2">
      {/* Zoom +/- group */}
      <div className="flex flex-col gap-0 rounded-xl bg-card p-1 shadow-lg ring-1 ring-border/50">
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

      {/* Compass/Reset — below the zoom group */}
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-xl bg-card shadow-lg ring-1 ring-border/50"
        onClick={resetViewport}
      >
        <Navigation className="h-4 w-4" />
      </Button>
    </div>
  );
}
