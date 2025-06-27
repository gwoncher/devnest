// 项目类型定义
export interface Project {
  id: string;
  name: string;
  path: string;
  type: string;
  pinned?: boolean;
}

// 项目配置类型定义
export interface ProjectConfig {
  projectDirectories: string[];
  projects: Project[];
}

// 选择项目目录结果
export interface SelectDirectoryResult {
  success: boolean;
  message?: string;
  directory?: string;
  projects?: Project[];
}

// 扩展 window 接口，添加 electron 对象
declare global {
  interface Window {
    electron?: {
      getProjects: () => Promise<ProjectConfig>;
      selectProjectDirectory: () => Promise<SelectDirectoryResult | undefined>;
      openProject: (projectPath: string) => Promise<boolean>;
      saveProjects: (config: ProjectConfig) => Promise<boolean>;
    };
  }
}
