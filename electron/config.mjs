/*
 * @Author: quanzhe
 * @Date: 2025-06-30 13:58:13
 * @LastEditors: quanzhe
 * @LastEditTime: 2025-07-02 21:50:30
 * @Description:
 */

import { app } from "electron";
import path from "path";
import fs from "fs";

// 项目配置文件路径
export const getProjectsConfigPath = () => path.join(app.getPath("userData"), "projects.json");

// 应用配置文件路径
export const getAppConfigPath = () => path.join(app.getPath("userData"), "app-config.json");

// 读取项目配置
export const readProjectsConfig = () => {
  const configPath = getProjectsConfigPath();
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to read projects config:", error);
  }
  return { projectDirectories: [], projects: [] };
};

// 保存项目配置
export const saveProjectsConfig = config => {
  const configPath = getProjectsConfigPath();
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error("Failed to save projects config:", error);
    return false;
  }
};

// 获取应用配置
export const getAppConfig = () => {
  const configPath = getAppConfigPath();
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to read app config:", error);
  }
  return {
    editorPath: "",
    defaultEditor: process.platform === "darwin" ? "cursor" : "cursor",
    searchShortcut: "",
  };
};

// 保存应用配置
export const saveAppConfig = config => {
  const configPath = getAppConfigPath();
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error("Failed to save app config:", error);
    return false;
  }
};
