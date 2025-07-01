import { app } from "electron";
import path from "path";
import { setupIpcHandlers } from "./ipc.mjs";
import { createMainWindow } from "./window.mjs";
import { isDev } from "./constants.mjs";

// 保持对窗口对象的全局引用，避免 JavaScript 对象被垃圾回收时窗口关闭
let mainWindow;
// 跟踪IPC处理程序是否已设置
let ipcHandlersInitialized = false;

function initializeApp() {
  // 确定预加载脚本的路径
  let preloadPath;
  if (isDev) {
    preloadPath = path.join(process.cwd(), "electron/preload.mjs");
  } else {
    // 在 Mac 打包应用中，文件位于 Resources/app.asar 内
    preloadPath = path.join(app.getAppPath(), "electron/preload.mjs");
  }

  // 创建主窗口
  mainWindow = createMainWindow(preloadPath, isDev, app.getAppPath());

  // 当窗口关闭时触发
  mainWindow.on("closed", function () {
    mainWindow = null;
  });

  // 只有在尚未初始化的情况下才设置IPC处理程序
  if (!ipcHandlersInitialized) {
    setupIpcHandlers(mainWindow, isDev);
    ipcHandlersInitialized = true;
  }
}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(initializeApp);

// 所有窗口关闭时退出应用
app.on("window-all-closed", function () {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出
  // 否则绝大部分应用及其菜单栏会保持激活
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  // 在 macOS 上，当点击 dock 图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口
  if (mainWindow === null) initializeApp();
});
