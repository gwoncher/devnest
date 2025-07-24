import type { ProjectConfig, SelectDirectoryResult, MainProcessError, AppInfo, AppConfig, EditorType } from "./project";

export interface ElectronAPI {
  getProjects: () => Promise<ProjectConfig>;
  selectProjectDirectory: () => Promise<SelectDirectoryResult | undefined>;
  openProject: (projectPath: string) => Promise<boolean>;
  saveProjects: (config: ProjectConfig) => Promise<boolean>;
  onMainProcessError: (callback: (error: MainProcessError) => void) => void;
  getAppInfo: () => Promise<AppInfo>;
  getAppConfig: () => Promise<AppConfig>;
  setEditorPath: (editorPath: string) => Promise<boolean>;
  setDefaultEditor: (editor: EditorType) => Promise<boolean>;
  setSearchShortcut: (shortcut: string) => Promise<boolean>;
  closeSearchWindow: () => void;
  refreshProjectDirectory: (directoryPath: string) => Promise<{
    success: boolean;
    message: string;
    directory: string;
    addedProjects: any[];
    totalNew: number;
    error?: string;
  }>;
  refreshAllDirectories: () => Promise<{
    success: boolean;
    message: string;
    results: Array<{
      directory: string;
      addedProjects: any[];
      totalNew: number;
      success: boolean;
      message: string;
      error?: string;
    }>;
    totalNewProjects: number;
    error?: string;
  }>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
