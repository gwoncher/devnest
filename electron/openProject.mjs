import { shell } from "electron";
import fs from "fs";
import { exec } from "child_process";
import { EDITOR_COMMANDS } from "./constants.mjs";

/**
 * 打开项目
 * @param {string} projectPath - 项目路径
 * @param {string} editorCmd - 编辑器命令
 * @param {Function} errorCallback - 错误回调函数
 * @returns {Promise<boolean>} - 是否成功打开
 */
export const openProject = async (projectPath, editorCmd, errorCallback) => {
  try {
    console.log("打开项目: ", projectPath, "使用编辑器:", editorCmd);

    // 使用编辑器特定的协议或命令打开项目
    const editorConfig = EDITOR_COMMANDS[editorCmd];

    if (!editorConfig) {
      // 对于未配置的编辑器，尝试直接使用命令行
      return openWithGenericEditor(projectPath, editorCmd, errorCallback);
    }

    if (editorCmd === "vscode") {
      // VSCode 使用 URL 协议
      const success = await shell.openExternal(`${editorConfig.protocol}${projectPath}`);
      return success;
    } else if (editorCmd === "cursor") {
      // Cursor 编辑器使用命令行方式打开
      // 获取 Cursor 可能的安装路径
      let cursorPath = editorConfig[process.platform] || editorConfig.fallback;

      if (process.platform === "darwin" && !fs.existsSync(cursorPath)) {
        cursorPath = editorConfig.fallback; // 如果找不到，尝试使用命令名称
      }

      console.log("使用 Cursor 打开项目:", cursorPath, projectPath);

      exec(`"${cursorPath}" "${projectPath}"`, error => {
        if (error && errorCallback) {
          errorCallback({
            message: `打开 Cursor 失败: ${error.message}\n路径: ${projectPath}`,
            stack: error.stack,
          });
          console.error(`执行 Cursor 命令时出错: ${error}`);
        }
      });
      return true;
    } else if (editorConfig.protocol) {
      // 使用协议的编辑器
      const success = await shell.openExternal(`${editorConfig.protocol}${encodeURIComponent(projectPath)}`);
      return success;
    } else if (editorConfig.command) {
      // 使用命令的编辑器
      exec(`${editorConfig.command} "${projectPath}"`, error => {
        if (error && errorCallback) {
          errorCallback({
            message: `打开编辑器失败: ${error.message}\n路径: ${projectPath}`,
            stack: error.stack,
          });
        }
      });
      return true;
    } else {
      return openWithGenericEditor(projectPath, editorCmd, errorCallback);
    }
  } catch (error) {
    console.error("打开项目失败:", error);
    if (errorCallback) {
      errorCallback({
        message: `打开项目失败: ${error.message}\n路径: ${projectPath}`,
        stack: error.stack,
      });
    }
    return false;
  }
};

/**
 * 使用通用方式打开编辑器
 * @param {string} projectPath - 项目路径
 * @param {string} editorCmd - 编辑器命令
 * @param {Function} errorCallback - 错误回调函数
 * @returns {boolean} - 是否成功打开
 */
const openWithGenericEditor = (projectPath, editorCmd, errorCallback) => {
  try {
    // 对于其他编辑器，尝试使用命令行方式打开
    exec(`${editorCmd} "${projectPath}"`, error => {
      if (error && errorCallback) {
        errorCallback({
          message: `打开项目失败: ${error.message}\n路径: ${projectPath}\n编辑器: ${editorCmd}`,
          stack: error.stack,
        });
        console.error(`执行命令时出错: ${error}`);
      }
    });
    return true;
  } catch (error) {
    console.error("执行编辑器命令失败:", error);
    if (errorCallback) {
      errorCallback({
        message: `执行编辑器命令失败: ${error.message}`,
        stack: error.stack,
      });
    }
    return false;
  }
};
