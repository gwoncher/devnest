import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeMode = "light" | "dark";

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    set => ({
      themeMode: "dark",

      setThemeMode: mode => set({ themeMode: mode }),

      toggleThemeMode: () =>
        set(state => ({
          themeMode: state.themeMode === "dark" ? "light" : "dark",
        })),
    }),
    {
      name: "theme-storage",
    }
  )
);
