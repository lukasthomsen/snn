import { createStore } from "zustand/vanilla";

export type OverlayKind = "cart" | "filters" | "search" | "support";

export type InterfaceState = {
  activeOverlay: OverlayKind | null;
  mobileNavigationOpen: boolean;
  setActiveOverlay: (overlay: OverlayKind | null) => void;
  setMobileNavigationOpen: (open: boolean) => void;
  reset: () => void;
};

export function createInterfaceStore() {
  return createStore<InterfaceState>((set) => ({
    activeOverlay: null,
    mobileNavigationOpen: false,
    setActiveOverlay: (overlay) => {
      set({ activeOverlay: overlay });
    },
    setMobileNavigationOpen: (open) => {
      set({ mobileNavigationOpen: open });
    },
    reset: () => {
      set({
        activeOverlay: null,
        mobileNavigationOpen: false,
      });
    },
  }));
}

