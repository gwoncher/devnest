// 预加载脚本，用于在渲染进程中安全地暴露 Node.js API
import { contextBridge, ipcRenderer } from "electron";

// 暴露 API 给渲染进程
contextBridge.exposeInMainWorld("electron", {
  // 可以在这里添加需要暴露给渲染进程的方法
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  receive: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  // 项目管理相关方法
  getProjects: () => ipcRenderer.invoke("get-projects"),
  selectProjectDirectory: () => ipcRenderer.invoke("select-project-directory"),
  openProject: projectPath => ipcRenderer.invoke("open-project", projectPath),
  saveProjects: config => ipcRenderer.invoke("save-projects", config),

  // 应用配置相关方法
  getAppConfig: () => ipcRenderer.invoke("get-app-config"),
  setEditorPath: editorPath => ipcRenderer.invoke("set-editor-path", editorPath),
  setDefaultEditor: editor => ipcRenderer.invoke("set-default-editor", editor),

  // 获取应用信息
  getAppInfo: () => ipcRenderer.invoke("get-app-info"),

  // 添加主进程错误监听
  onMainProcessError: callback => {
    ipcRenderer.on("main-process-error", (event, error) => {
      callback(error);
    });
  },
});
