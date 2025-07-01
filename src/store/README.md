# 状态管理 (State Management)

本项目使用 [Zustand](https://github.com/pmndrs/zustand) 进行状态管理。Zustand 是一个轻量级的状态管理库，具有简单的 API 和良好的性能。

## 状态存储结构

项目状态被分为以下几个存储：

### 1. 项目存储 (projectStore)

管理项目列表、项目目录和项目操作相关的状态。

```typescript
interface ProjectState {
  loading: boolean;
  projectConfig: ProjectConfig;
  openingProject: string | null;
  activeTab: string;
  searchQuery: string;
  
  // Actions & Thunks
  fetchProjects: () => Promise<void>;
  selectProjectDirectory: () => Promise<void>;
  openProject: (project: Project) => Promise<void>;
  togglePinProject: (project: Project) => Promise<void>;
  // ...
}
```

### 2. 配置存储 (configStore)

管理应用配置，如默认编辑器设置。

```typescript
interface ConfigState {
  appConfig: AppConfig;
  settingsVisible: boolean;
  
  // Actions & Thunks
  fetchAppConfig: () => Promise<void>;
  setEditorPath: (path: string) => Promise<boolean>;
  setDefaultEditor: (editor: EditorType) => Promise<boolean>;
  // ...
}
```

### 3. 应用信息存储 (appStore)

管理应用信息和错误处理。

```typescript
interface AppState {
  appInfo: AppInfo | null;
  mainProcessError: MainProcessError | null;
  
  // Actions & Thunks
  fetchAppInfo: () => Promise<void>;
  setupErrorListener: () => void;
  // ...
}
```

### 4. 主题存储 (themeStore)

管理应用主题设置，支持深色/浅色模式切换。

```typescript
interface ThemeState {
  themeMode: 'light' | 'dark';
  setThemeMode: (mode: 'light' | 'dark') => void;
  toggleThemeMode: () => void;
}
```

## 使用方法

```jsx
import { useProjectStore, useConfigStore, useAppStore, useThemeStore } from './store';

function MyComponent() {
  // 从项目存储中获取状态和操作
  const { 
    projectConfig, 
    fetchProjects,
    openProject 
  } = useProjectStore();
  
  // 从主题存储中获取状态和操作
  const { themeMode, toggleThemeMode } = useThemeStore();
  
  // 组件逻辑...
}
```

## 设计原则

1. **职责分离**: 每个存储负责管理应用的一个特定方面
2. **简单性**: 保持 API 简单直观
3. **性能**: 避免不必要的重渲染
4. **持久化**: 主题等用户偏好使用 `persist` 中间件持久化到本地存储 