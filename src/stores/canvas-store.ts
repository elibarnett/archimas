import { create } from "zustand";

export type CanvasTool = "select" | "pan" | "pin";

interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
  activeTool: CanvasTool;
  selectedPinId: string | null;
  initialZoom: number;
  initialPanX: number;
  initialPanY: number;

  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setActiveTool: (tool: CanvasTool) => void;
  setSelectedPinId: (id: string | null) => void;
  setInitialViewport: (zoom: number, panX: number, panY: number) => void;
  resetViewport: () => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  zoom: 1,
  panX: 0,
  panY: 0,
  activeTool: "select",
  selectedPinId: null,
  initialZoom: 1,
  initialPanX: 0,
  initialPanY: 0,

  setZoom: (zoom) => set({ zoom: Math.min(Math.max(zoom, 0.1), 10) }),
  setPan: (panX, panY) => set({ panX, panY }),
  setActiveTool: (activeTool) => set({ activeTool, selectedPinId: null }),
  setSelectedPinId: (selectedPinId) => set({ selectedPinId }),
  setInitialViewport: (zoom, panX, panY) =>
    set({ initialZoom: zoom, initialPanX: panX, initialPanY: panY }),
  resetViewport: () => {
    const { initialZoom, initialPanX, initialPanY } = get();
    set({ zoom: initialZoom, panX: initialPanX, panY: initialPanY });
  },
}));
