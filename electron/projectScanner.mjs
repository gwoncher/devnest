import fs from "fs";
import path from "path";
import { PROJECT_INDICATORS, PROJECT_TYPES } from "./constants.mjs";

/**
 * 扫描目录下的前端项目
 * @param {string} directoryPath - 要扫描的目录路径
 * @returns {Array} - 发现的项目列表
 */
export const scanForProjects = directoryPath => {
  const projects = [];

  try {
    const items = fs.readdirSync(directoryPath, { withFileTypes: true });

    for (const item of items) {
      if (item.isDirectory()) {
        const projectPath = path.join(directoryPath, item.name);

        // 检查是否是前端项目
        if (isJavaScriptProject(projectPath)) {
          projects.push({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: item.name,
            path: projectPath,
            type: detectProjectType(projectPath),
          });
        }
      }
    }
  } catch (error) {
    console.error(`扫描目录失败 ${directoryPath}:`, error);
  }

  return projects;
};

/**
 * 检查是否是JavaScript/前端项目
 * @param {string} projectPath - 项目路径
 * @returns {boolean} - 是否是前端项目
 */
export const isJavaScriptProject = projectPath => {
  return PROJECT_INDICATORS.some(file => fs.existsSync(path.join(projectPath, file)));
};

/**
 * 检测项目类型
 * @param {string} projectPath - 项目路径
 * @returns {string} - 项目类型
 */
export const detectProjectType = projectPath => {
  try {
    if (fs.existsSync(path.join(projectPath, "package.json"))) {
      const packageJson = JSON.parse(fs.readFileSync(path.join(projectPath, "package.json"), "utf8"));

      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      if (dependencies.react) return PROJECT_TYPES.REACT;
      if (dependencies.vue) return PROJECT_TYPES.VUE;
      if (dependencies.angular) return PROJECT_TYPES.ANGULAR;
      if (dependencies.next) return PROJECT_TYPES.NEXTJS;
      if (dependencies.nuxt) return PROJECT_TYPES.NUXTJS;
    }

    return PROJECT_TYPES.JAVASCRIPT;
  } catch (error) {
    return PROJECT_TYPES.JAVASCRIPT;
  }
};
