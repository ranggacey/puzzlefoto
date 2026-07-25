import { create } from "zustand";

interface UIState {
  /** Whether the mobile navigation menu is open */
  isMobileMenuOpen: boolean;
  /** Whether the app is in a loading transition between views */
  isTransitioning: boolean;
  /** Currently active modal identifier, or null */
  activeModal: string | null;

  // Actions
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setTransitioning: (transitioning: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isTransitioning: false,
  activeModal: null,

  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  setTransitioning: (transitioning) => set({ isTransitioning: transitioning }),
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
}));
