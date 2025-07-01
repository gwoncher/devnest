import { BrowserWindow } from "electron";
import path from "path";
import { DEFAULT_WINDOW_CONFIG, isDev } from "./constants.mjs";

/**
 * 创建主应用窗口
 * @param {string} preloadPath - 预加载脚本路径
 * @param {boolean} isDev - 是否是开发环境
 * @param {string} appPath - 应用路径
 * @returns {BrowserWindow} - 创建的窗口实例
 */
export const createMainWindow = (preloadPath, isDev, appPath) => {
  console.log("Using preload path:", preloadPath);

  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: DEFAULT_WINDOW_CONFIG.width,
    height: DEFAULT_WINDOW_CONFIG.height,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: preloadPath,
    },
  });

  // 加载应用
  if (isDev) {
    // 开发环境下，加载 Vite 开发服务器
    mainWindow.loadURL("http://localhost:5173");
    // 打开开发工具
    mainWindow.webContents.openDevTools();

    // 在开发环境中配置热重载
    import("electron-reloader")
      .then(electronReloader => {
        electronReloader(module, {
          debug: true,
          watchRenderer: true,
        });
      })
      .catch(err => {
        console.error("Error setting up electron-reloader:", err);
      });
  } else {
    // 生产环境下，加载打包后的文件
    const htmlPath = path.join(appPath, "dist/index.html");
    console.log("HTML path:", htmlPath);
    mainWindow.loadFile(htmlPath);
    // 临时添加以下行来调试
    mainWindow.webContents.openDevTools();
  }

  // 监听渲染进程的错误
  mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
    console.error("页面加载失败:", errorCode, errorDescription);
  });

  // 监听控制台消息
  mainWindow.webContents.on("console-message", (event, level, message, line, sourceId) => {
    console.log(`[渲染进程控制台] ${message}`);
  });

  return mainWindow;
};
