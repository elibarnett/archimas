"use client";

import { MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCanvasStore } from "@/stores/canvas-store";

export function PinPlacementOverlay() {
  const activeTool = useCanvasStore((s) => s.activeTool);
  const setActiveTool = useCanvasStore((s) => s.setActiveTool);

  if (activeTool !== "pin") return null;

  return (
    <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg">
        <MapPin className="h-4 w-4" />
        <span>Tap to place pin</span>
        <Button
          variant="ghost"
          size="icon"
          className="ml-1 h-6 w-6 rounded-full text-primary-foreground hover:bg-primary-foreground/20"
          onClick={() => setActiveTool("select")}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
