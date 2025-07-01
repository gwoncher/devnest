/**
 * Electron 架构设计规范
 */

export const ELECTRON_ARCHITECTURE_RULES = {
  /**
   * 模块化原则
   */
  moduleRules: {
    // 统一使用 ESM 模块规范
    useESM: true,
    // 禁止使用 CJS 模块规范
    useCJS: false,
    // 文件扩展名规范
    fileExtension: ".mjs",
  },

  /**
   * 目录结构规范
   */
  directoryStructure: {
    // 主进程核心文件
    core: [
      "main.mjs", // 应用入口
      "preload.mjs", // 预加载脚本
      "constants.mjs", // 常量定义
    ],

    // 功能模块目录
    modules: {
      // 配置管理模块
      config: {
        file: "config.mjs",
        description: "负责应用配置和项目配置的读写操作",
      },

      // 窗口管理模块
      window: {
        file: "window.mjs",
        description: "负责创建和管理应用窗口",
      },

      // IPC 通信模块
      ipc: {
        file: "ipc.mjs",
        description: "负责处理渲染进程和主进程间的通信",
      },

      // 项目扫描模块
      projectScanner: {
        file: "projectScanner.mjs",
        description: "负责扫描目录和检测项目类型",
      },

      // 项目打开模块
      projectOpener: {
        file: "openProject.mjs",
        description: "负责使用不同编辑器打开项目",
      },

      // 应用信息模块
      appInfo: {
        file: "appInfo.mjs",
        description: "负责收集和提供应用信息",
      },
    },

    // 可选功能模块
    optionalModules: [
      "menu.mjs", // 应用菜单
      "tray.mjs", // 系统托盘
      "updater.mjs", // 自动更新
      "logger.mjs", // 日志记录
      "shortcut.mjs", // 快捷键
    ],
  },

  /**
   * 通信规范
   */
  communicationRules: {
    // IPC 命名规范
    ipcNaming: {
      get: "get-*", // 获取数据的方法
      set: "set-*", // 设置数据的方法
      action: "*-action", // 执行动作的方法
      event: "*-event", // 事件通知
    },

    // 错误处理规范
    errorHandling: {
      // 使用统一的错误回调
      useErrorCallback: true,
      // 错误通知渲染进程的事件名
      errorEventName: "main-process-error",
    },
  },

  /**
   * 安全规范
   */
  securityRules: {
    // 上下文隔离
    contextIsolation: true,
    // 禁用 Node 集成
    nodeIntegration: false,
    // 禁用远程模块
    enableRemoteModule: false,
    // 内容安全策略
    contentSecurityPolicy: true,
  },
};
