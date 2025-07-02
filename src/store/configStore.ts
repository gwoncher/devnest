import { create } from "zustand";
import type { AppConfig } from "../types/project";
import { EditorType } from "../types/enum";

interface ConfigState {
  appConfig: AppConfig;
  settingsVisible: boolean;

  // Actions
  setAppConfig: (config: AppConfig) => void;
  setSettingsVisible: (visible: boolean) => void;

  // Thunks
  fetchAppConfig: () => Promise<void>;
  setEditorPath: (path: string) => Promise<boolean>;
  setDefaultEditor: (editor: EditorType) => Promise<boolean>;
  setSearchShortcut: (shortcut: string) => Promise<boolean>;
}

export const useConfigStore = create<ConfigState>(set => ({
  appConfig: {
    editorPath: "",
    defaultEditor: EditorType.Cursor,
    searchShortcut: "Command+Space",
  },
  settingsVisible: false,

  // Actions
  setAppConfig: config => set({ appConfig: config }),
  setSettingsVisible: visible => set({ settingsVisible: visible }),

  // Thunks
  fetchAppConfig: async () => {
    try {
      const config = await window.electron?.getAppConfig();
      if (config) {
        set({ appConfig: config });
      }
    } catch (error) {
      console.error("Failed to fetch app config:", error);
    }
  },

  setEditorPath: async path => {
    try {
      const success = await window.electron?.setEditorPath(path);
      if (success) {
        set(state => ({
          appConfig: {
            ...state.appConfig,
            editorPath: path,
          },
        }));
      }
      return success || false;
    } catch (error) {
      console.error("Failed to set editor path:", error);
      return false;
    }
  },

  setDefaultEditor: async editor => {
    try {
      const success = await window.electron?.setDefaultEditor(editor);
      if (success) {
        set(state => ({
          appConfig: {
            ...state.appConfig,
            defaultEditor: editor,
          },
        }));
      }
      return success || false;
    } catch (error) {
      console.error("Failed to set default editor:", error);
      return false;
    }
  },

  setSearchShortcut: async shortcut => {
    try {
      const success = await window.electron?.setSearchShortcut(shortcut);
      if (success) {
        set(state => ({
          appConfig: {
            ...state.appConfig,
            searchShortcut: shortcut,
          },
        }));
      }
      return success || false;
    } catch (error) {
      console.error("Failed to set search shortcut:", error);
      return false;
    }
  },
}));
