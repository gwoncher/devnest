import { create } from "zustand";
import type { AppInfo, MainProcessError } from "../types/project";

interface AppState {
  appInfo: AppInfo | null;
  mainProcessError: MainProcessError | null;

  // Actions
  setAppInfo: (info: AppInfo) => void;
  setMainProcessError: (error: MainProcessError | null) => void;

  // Thunks
  fetchAppInfo: () => Promise<void>;
  setupErrorListener: () => void;
}

export const useAppStore = create<AppState>(set => ({
  appInfo: null,
  mainProcessError: null,

  // Actions
  setAppInfo: info => set({ appInfo: info }),
  setMainProcessError: error => set({ mainProcessError: error }),

  // Thunks
  fetchAppInfo: async () => {
    try {
      const info = await window.electron?.getAppInfo();
      if (info) {
        set({ appInfo: info });
      }
    } catch (error) {
      console.error("Failed to fetch app info:", error);
    }
  },

  setupErrorListener: () => {
    if (window.electron?.onMainProcessError) {
      window.electron.onMainProcessError(error => {
        console.error("Main process error:", error);
        set({ mainProcessError: error });
      });
    }
  },
}));
