/**
 * 应用常量配置
 */

// 开发环境标识
export const isDev = process.env.NODE_ENV === "development";

// 窗口默认配置
export const DEFAULT_WINDOW_CONFIG = {
  width: 1200,
  height: 800,
};

// 项目类型标识
export const PROJECT_TYPES = {
  REACT: "React",
  VUE: "Vue",
  ANGULAR: "Angular",
  NEXTJS: "Next.js",
  NUXTJS: "Nuxt.js",
  JAVASCRIPT: "JavaScript",
};

// 前端项目指示器文件
export const PROJECT_INDICATORS = [
  "package.json",
  "node_modules",
  "webpack.config.js",
  "vite.config.js",
  "vite.config.ts",
  "next.config.js",
  "angular.json",
  ".eslintrc",
];

// 编辑器命令映射
export const EDITOR_COMMANDS = {
  vscode: {
    protocol: "vscode://file/",
    command: "code",
  },
  cursor: {
    darwin: "/Applications/Cursor.app/Contents/MacOS/Cursor",
    win32: "cursor",
    linux: "cursor",
    fallback: "cursor",
  },
  webstorm: {
    protocol: "webstorm://open?file=",
    command: "webstorm",
  },
  idea: {
    protocol: "idea://open?file=",
    command: "idea",
  },
  atom: {
    protocol: "atom://open?url=file://",
    command: "atom",
  },
  subl: {
    command: "subl",
  },
};
