import { ipcMain, dialog } from "electron";
import { readProjectsConfig, saveProjectsConfig, getAppConfig, saveAppConfig } from "./config.mjs";
import { openProject } from "./openProject.mjs";
import { scanForProjects } from "./projectScanner.mjs";
import { getAppInfo } from "./appInfo.mjs";

// 跟踪已注册的处理程序
const registeredHandlers = new Set();

/**
 * 安全地移除已存在的IPC处理程序
 * @param {string} channel - IPC通道名称
 */
const safelyRemoveHandler = channel => {
  if (registeredHandlers.has(channel)) {
    try {
      ipcMain.removeHandler(channel);
    } catch (error) {
      console.warn(`尝试移除不存在的处理程序 ${channel}:`, error);
    }
    registeredHandlers.delete(channel);
  }
};

/**
 * 安全地注册IPC处理程序
 * @param {string} channel - IPC通道名称
 * @param {Function} handler - 处理函数
 */
const safelyRegisterHandler = (channel, handler) => {
  safelyRemoveHandler(channel);
  ipcMain.handle(channel, handler);
  registeredHandlers.add(channel);
};

/**
 * 设置IPC处理程序
 * @param {BrowserWindow} mainWindow - 主窗口实例
 * @param {boolean} isDev - 是否是开发环境
 */
export const setupIpcHandlers = (mainWindow, isDev) => {
  // 获取所有项目
  safelyRegisterHandler("get-projects", () => {
    return readProjectsConfig();
  });

  // 保存项目配置
  safelyRegisterHandler("save-projects", (event, config) => {
    return saveProjectsConfig(config);
  });

  // 选择项目目录
  safelyRegisterHandler("select-project-directory", async () => {
    if (!mainWindow) return null;

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
    });

    if (result.canceled || !result.filePaths.length) {
      return null;
    }

    const selectedDir = result.filePaths[0];
    const config = readProjectsConfig();

    // 检查是否已经添加过
    if (config.projectDirectories.includes(selectedDir)) {
      return { success: false, message: "该目录已添加" };
    }

    // 添加到配置
    config.projectDirectories.push(selectedDir);

    // 扫描该目录下的前端项目
    const projects = scanForProjects(selectedDir);
    config.projects = [...config.projects, ...projects];

    // 保存配置
    const success = saveProjectsConfig(config);
    return { success, directory: selectedDir, projects };
  });

  // 打开项目
  safelyRegisterHandler("open-project", async (event, projectPath) => {
    try {
      const appConfig = getAppConfig();
      // 获取编辑器命令
      let editorCmd = appConfig.defaultEditor || "cursor";

      // 使用错误回调函数处理错误
      const errorCallback = error => {
        if (mainWindow) {
          mainWindow.webContents.send("main-process-error", error);
        }
      };

      return await openProject(projectPath, editorCmd, errorCallback);
    } catch (error) {
      console.error("打开项目失败:", error);
      if (mainWindow) {
        mainWindow.webContents.send("main-process-error", {
          message: `打开项目失败: ${error.message}\n路径: ${projectPath}`,
          stack: error.stack,
        });
      }
      return false;
    }
  });

  // 设置编辑器路径
  safelyRegisterHandler("set-editor-path", async (event, editorPath) => {
    try {
      const appConfig = getAppConfig();
      appConfig.editorPath = editorPath;
      return saveAppConfig(appConfig);
    } catch (error) {
      console.error("设置编辑器路径失败:", error);
      return false;
    }
  });

  // 设置默认编辑器
  safelyRegisterHandler("set-default-editor", async (event, editor) => {
    try {
      const appConfig = getAppConfig();
      appConfig.defaultEditor = editor;
      return saveAppConfig(appConfig);
    } catch (error) {
      console.error("设置默认编辑器失败:", error);
      if (mainWindow) {
        mainWindow.webContents.send("main-process-error", {
          message: `设置默认编辑器失败: ${error.message}`,
          stack: error.stack,
        });
      }
      return false;
    }
  });

  // 获取应用配置
  safelyRegisterHandler("get-app-config", () => {
    return getAppConfig();
  });

  // 获取应用信息
  safelyRegisterHandler("get-app-info", () => {
    return getAppInfo(isDev);
  });
};
