import { create } from "zustand";
import type { Project, ProjectConfig, SelectDirectoryResult } from "../types/project";

interface ProjectState {
  loading: boolean;
  projectConfig: ProjectConfig;
  openingProject: string | null;
  activeTab: string;
  searchQuery: string;

  // Actions
  setLoading: (loading: boolean) => void;
  setProjectConfig: (config: ProjectConfig) => void;
  setOpeningProject: (projectId: string | null) => void;
  setActiveTab: (tabKey: string) => void;
  setSearchQuery: (query: string) => void;

  // Thunks
  initProject: () => Promise<void>;
  fetchProjects: () => Promise<ProjectConfig | undefined>;
  selectProjectDirectory: () => Promise<void>;
  refreshAllDirectories: () => Promise<{ success: boolean; message: string; totalNewProjects: number }>;
  openProject: (project: Project) => Promise<void>;
  togglePinProject: (project: Project) => Promise<void>;
  setGroupOrder: (order: string[]) => Promise<void>;
  saveProjectConfig: (config: ProjectConfig) => Promise<void>;

  // Computed
  getFilteredProjects: () => { key: string; label: string; projects: Project[] }[];
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  loading: true,
  projectConfig: {
    projectDirectories: [],
    projects: [],
    groupOrder: [],
  },
  openingProject: null,
  activeTab: "",
  searchQuery: "",

  // Actions
  setLoading: loading => set({ loading }),
  setProjectConfig: config => set({ projectConfig: config }),
  setOpeningProject: projectId => set({ openingProject: projectId }),
  setActiveTab: tabKey => set({ activeTab: tabKey }),
  setSearchQuery: query => set({ searchQuery: query }),

  // Thunks
  initProject: async () => {
    const { fetchProjects } = get();
    const config = await fetchProjects();
    if (config && config.projectDirectories.length > 0) {
      set({ activeTab: config.projectDirectories[0] });
    }
  },

  fetchProjects: async () => {
    try {
      set({ loading: true });
      const config = await window.electron.getProjects();
      if (config) {
        set({ projectConfig: config });
      }
      return config;
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      set({ loading: false });
    }
  },

  selectProjectDirectory: async () => {
    const { fetchProjects } = get();
    try {
      set({ loading: true });
      const result = (await window.electron?.selectProjectDirectory()) as SelectDirectoryResult | undefined;

      if (!result) return;

      if (result.success && result.directory) {
        await fetchProjects();
        set({ activeTab: result.directory });
      }
    } catch (error) {
      console.error("Failed to select project directory:", error);
    } finally {
      set({ loading: false });
    }
  },

  refreshAllDirectories: async () => {
    const { fetchProjects } = get();
    try {
      set({ loading: true });
      const result = await window.electron?.refreshAllDirectories();

      if (result?.success) {
        // 刷新项目列表
        await fetchProjects();
        return {
          success: true,
          message: result.message,
          totalNewProjects: result.totalNewProjects || 0,
        };
      } else {
        return {
          success: false,
          message: result?.message || "扫描失败",
          totalNewProjects: 0,
        };
      }
    } catch (error) {
      console.error("Failed to refresh all directories:", error);
      return {
        success: false,
        message: "扫描所有目录失败",
        totalNewProjects: 0,
      };
    } finally {
      set({ loading: false });
    }
  },

  openProject: async project => {
    try {
      set({ openingProject: project.id });
      await window.electron?.openProject(project.path);
    } catch (error) {
      console.error("Failed to open project:", error);
    } finally {
      set({ openingProject: null });
    }
  },

  togglePinProject: async project => {
    const { projectConfig, saveProjectConfig } = get();
    const updatedProjects = projectConfig.projects.map(p => (p.id === project.id ? { ...p, pinned: !p.pinned } : p));

    const updatedConfig = {
      ...projectConfig,
      projects: updatedProjects,
    };

    await saveProjectConfig(updatedConfig);
  },

  setGroupOrder: async (order: string[]) => {
    const { projectConfig, saveProjectConfig } = get();
    const updatedConfig = { ...projectConfig, projectDirectories: order };
    await saveProjectConfig(updatedConfig);
  },

  // 保存项目配置
  saveProjectConfig: async config => {
    try {
      const success = await window.electron?.saveProjects(config);
      if (success) {
        set({ projectConfig: config });
      }
    } catch (error) {
      console.error("Failed to save project config:", error);
    }
  },
  // Computed

  getFilteredProjects: () => {
    const { projectConfig, searchQuery } = get();

    const tabItems = projectConfig.projectDirectories.map(dir => {
      let projects = projectConfig.projects.filter(project => project.path.startsWith(dir));
      if (searchQuery) {
        projects = projects.filter(project => project.name.toLowerCase().includes(searchQuery.toLowerCase()));
      }
      projects.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return a.name.localeCompare(b.name);
      });

      return {
        key: dir,
        label: dir.split("/").pop() || dir,
        projects: projects,
      };
    });
    return tabItems;
  },
}));
