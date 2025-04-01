import { create } from "zustand";

export const useCommuniationOverlayStore = create<{
  isActive: boolean;
  toggle: () => void;
}>((set) => ({
  isActive: false,
  toggle: () => set(({ isActive }) => ({ isActive: !isActive })),
}));
