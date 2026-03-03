import { create } from "zustand";

interface UIState {
  filterPanelOpen: boolean;
  setFilterPanelOpen: (open: boolean) => void;
  toggleFilterPanel: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  filterPanelOpen: false,
  setFilterPanelOpen: (filterPanelOpen) => set({ filterPanelOpen }),
  toggleFilterPanel: () =>
    set((state) => ({ filterPanelOpen: !state.filterPanelOpen })),
}));
