import { globalShortcut } from "electron";
import { getAppConfig, saveAppConfig } from "./config.mjs";
import { createSearchWindow } from "./window.mjs";

/**
 * 注册全局快捷键
 * @param {BrowserWindow} mainWindow - 主窗口
 */
export const registerGlobalShortcuts = ({ preloadPath, appPath }) => {
  // 获取应用配置
  const appConfig = getAppConfig();
  const searchShortcut = appConfig.searchShortcut;

  // 注册快捷键
  try {
    if (searchShortcut) {
      // 注册搜索快捷键
      const ret = globalShortcut.register(searchShortcut, () => {
        createSearchWindow({ preloadPath, appPath });
      });

      if (!ret) {
        console.error("快捷键注册失败");
      } else {
        console.log(`搜索快捷键 ${searchShortcut} 注册成功`);
      }
    }
  } catch (error) {
    console.error("注册快捷键时出错:", error);
  }
};

/**
 * 更新搜索快捷键
 * @param {string} shortcut - 新的快捷键
 * @returns {Promise<boolean>} - 是否成功更新
 */
export const updateSearchShortcut = async ({ searchWindow, shortcut }) => {
  try {
    // 获取当前配置
    const appConfig = getAppConfig();

    // 更新快捷键设置
    appConfig.searchShortcut = shortcut;

    // 保存配置
    const success = await saveAppConfig(appConfig);

    // 重新注册快捷键
    if (success) {
      // 先注销所有快捷键
      globalShortcut.unregisterAll();

      // 获取主窗口
      registerGlobalShortcuts({ searchWindow });
    }

    return success;
  } catch (error) {
    console.error("更新搜索快捷键失败:", error);
    return false;
  }
};

/**
 * 注销所有全局快捷键
 */
export const unregisterAllShortcuts = () => {
  globalShortcut.unregisterAll();
};
