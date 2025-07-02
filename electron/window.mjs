import { BrowserWindow, screen } from "electron";
import path from "path";
import { DEFAULT_WINDOW_CONFIG, isDev } from "./constants.mjs";

/**
 * 创建主应用窗口
 * @param {string} preloadPath - 预加载脚本路径
 * @param {boolean} isDev - 是否是开发环境
 * @param {string} appPath - 应用路径
 * @returns {BrowserWindow} - 创建的窗口实例
 */
export const createMainWindow = ({ preloadPath, appPath }) => {
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
    show: false, // 先不显示窗口，等内容加载完成后再显示
    backgroundColor: "#FFFFFF", // 设置背景色，减少白屏闪烁
  });

  // 内容加载完成后再显示窗口，减少闪烁
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
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
  }

  // 监听渲染进程的错误
  mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
    console.error("页面加载失败:", errorCode, errorDescription);
  });

  // 监听控制台消息
  mainWindow.webContents.on("console-message", (event, level, message) => {
    console.log(`[渲染进程控制台] ${message}`);
  });

  return mainWindow;
};
let searchWindow = null;
export const createSearchWindow = ({ preloadPath, appPath }) => {
  if (searchWindow) {
    searchWindow.close();
  }
  const cursorPoint = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursorPoint);
  searchWindow = new BrowserWindow({
    width: 600,
    height: 400,
    transparent: true,
    frame: true, // ✅ 去掉系统边框和按钮
    resizable: false, // 可选：不允许调整大小
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: preloadPath,
    },
    hasShadow: false,
    x: display.bounds.x + (display.bounds.width - 800) / 2,
    y: display.bounds.y + (display.bounds.height - 600) / 2,
    show: true,
  });
  searchWindow.focus();

  // 添加失去焦点时自动关闭窗口
  searchWindow.on("blur", () => {
    searchWindow.close();
  });
  searchWindow.on("closed", function () {
    searchWindow = null;
    console.log("searchWindow closed");
  });

  if (isDev) {
    searchWindow.loadURL("http://localhost:5173/search");

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
    const htmlPath = path.join(appPath, "dist/index.html");
    console.log("HTML path:", htmlPath);
    searchWindow.loadFile(htmlPath, { hash: "search" });
  }

  // 监听渲染进程的错误
  searchWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
    console.error("页面加载失败:", errorCode, errorDescription);
  });

  // 监听控制台消息
  searchWindow.webContents.on("console-message", (event, level, message) => {
    console.log(`[渲染进程控制台] ${message}`);
  });

  return searchWindow;
};

export const closeSearchWindow = () => {
  if (searchWindow) {
    searchWindow.close();
  }
};
