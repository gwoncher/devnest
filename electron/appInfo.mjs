import { app } from "electron";
import fs from "fs";
import path from "path";

/**
 * 获取应用信息
 * @param {boolean} isDev - 是否是开发环境
 * @returns {Object} - 应用信息对象
 */
export const getAppInfo = isDev => {
  try {
    // 收集各种路径和环境信息
    const appInfo = {
      appPath: app.getAppPath(),
      appVersion: app.getVersion(),
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node,
      platform: process.platform,
      arch: process.arch,
      isPackaged: app.isPackaged,
      execPath: app.getPath("exe"),
      resourcesPath: process.resourcesPath,
      currentWorkingDir: process.cwd(),
      userDataPath: app.getPath("userData"),
      preloadPath: isDev
        ? path.join(process.cwd(), "electron/preload.mjs")
        : path.join(app.getAppPath(), "electron/preload.mjs"),
      preloadExists: fs.existsSync(
        isDev ? path.join(process.cwd(), "electron/preload.mjs") : path.join(app.getAppPath(), "electron/preload.mjs")
      ),
    };

    // 如果是打包版本，尝试列出 resources 目录内容
    if (app.isPackaged && process.resourcesPath) {
      try {
        appInfo.resourcesFiles = fs.readdirSync(process.resourcesPath);

        // 检查 app.asar 是否存在
        if (appInfo.resourcesFiles.includes("app.asar")) {
          appInfo.appAsarExists = true;
        }
      } catch (err) {
        appInfo.resourcesError = err.message;
      }
    }

    return appInfo;
  } catch (error) {
    console.error("获取应用信息失败:", error);
    return { error: error.message };
  }
};
