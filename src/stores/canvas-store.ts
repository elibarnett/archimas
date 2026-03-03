import { create } from "zustand";

export type CanvasTool = "select" | "pan" | "pin";

interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
  activeTool: CanvasTool;
  selectedPinId: string | null;

  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setActiveTool: (tool: CanvasTool) => void;
  setSelectedPinId: (id: string | null) => void;
  resetViewport: () => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  zoom: 1,
  panX: 0,
  panY: 0,
  activeTool: "select",
  selectedPinId: null,

  setZoom: (zoom) => set({ zoom: Math.min(Math.max(zoom, 0.1), 10) }),
  setPan: (panX, panY) => set({ panX, panY }),
  setActiveTool: (activeTool) => set({ activeTool, selectedPinId: null }),
  setSelectedPinId: (selectedPinId) => set({ selectedPinId }),
  resetViewport: () => set({ zoom: 1, panX: 0, panY: 0 }),
}));
