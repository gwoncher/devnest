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

// 应用配置类型定义
export interface AppConfig {
  editorPath: string;
  defaultEditor: EditorType;
  searchShortcut?: string;
}

// 选择项目目录结果
export interface SelectDirectoryResult {
  success: boolean;
  message?: string;
  directory?: string;
  projects?: Project[];
}

// 主进程错误类型
export interface MainProcessError {
  message: string;
  stack?: string;
}

// 应用信息类型
export interface AppInfo {
  appPath: string;
  appVersion: string;
  electronVersion: string;
  nodeVersion: string;
  platform: string;
  arch: string;
  isPackaged: boolean;
  execPath: string;
  resourcesPath?: string;
  currentWorkingDir: string;
  userDataPath: string;
  preloadPath: string;
  preloadExists: boolean;
  resourcesFiles?: string[];
  appAsarExists?: boolean;
  resourcesError?: string;
  error?: string;
}

// 扩展 window 接口，添加 electron 对象
declare global {}
