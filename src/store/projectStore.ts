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
  fetchProjects: () => Promise<void>;
  selectProjectDirectory: () => Promise<void>;
  openProject: (project: Project) => Promise<void>;
  togglePinProject: (project: Project) => Promise<void>;
  setGroupOrder: (order: string[]) => Promise<void>;
  saveProjectConfig: (config: ProjectConfig) => Promise<void>;

  // Computed
  getFilteredProjects: () => Project[];
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
  fetchProjects: async () => {
    try {
      set({ loading: true });
      const config = await window.electron?.getProjects();
      console.log("config", config);
      if (config) {
        set({ projectConfig: config });

        // If there are project directories, set the first one as active tab
        if (config.projectDirectories.length > 0) {
          set({ activeTab: config.projectDirectories[0] });
        }
      }
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
    const { projectConfig, activeTab, searchQuery } = get();

    // Filter by active tab (directory)
    let filteredProjects = projectConfig.projects;
    if (activeTab !== "all") {
      filteredProjects = filteredProjects.filter(project => project.path.startsWith(activeTab));
    }

    // Filter by search query
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filteredProjects = filteredProjects.filter(project => project.name.toLowerCase().includes(lowercaseQuery));
    }

    // Sort pinned projects first
    return [...filteredProjects].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return a.name.localeCompare(b.name);
    });
  },
}));
