import { app, BrowserWindow, ipcMain, dialog } from "electron"
import path from "path"
import fs from "fs"
const isDev = process.env.NODE_ENV === "development"

// 保持对窗口对象的全局引用，避免 JavaScript 对象被垃圾回收时窗口关闭
let mainWindow

// 项目配置文件路径
const getProjectsConfigPath = () =>
  path.join(app.getPath("userData"), "projects.json")

// 读取项目配置
const readProjectsConfig = () => {
  const configPath = getProjectsConfigPath()
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, "utf8")
      return JSON.parse(data)
    }
  } catch (error) {
    console.error("Failed to read projects config:", error)
  }
  return { projectDirectories: [], projects: [] }
}

// 保存项目配置
const saveProjectsConfig = (config) => {
  const configPath = getProjectsConfigPath()
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    return true
  } catch (error) {
    console.error("Failed to save projects config:", error)
    return false
  }
}

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(process.cwd(), "electron/preload.js")
    }
  })

  // 加载应用
  if (isDev) {
    // 开发环境下，加载 Vite 开发服务器
    mainWindow.loadURL("http://localhost:5173")
    // 打开开发工具
    mainWindow.webContents.openDevTools()

    // 在开发环境中配置热重载
    import("electron-reloader")
      .then((electronReloader) => {
        electronReloader(module, {
          debug: true,
          watchRenderer: true
        })
      })
      .catch((err) => {
        console.error("Error setting up electron-reloader:", err)
      })
  } else {
    // 生产环境下，加载打包后的文件
    mainWindow.loadFile(path.join(process.cwd(), "dist/index.html"))
  }

  // 当窗口关闭时触发
  mainWindow.on("closed", function () {
    mainWindow = null
  })
}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(() => {
  // 设置IPC处理程序
  setupIpcHandlers()
  createWindow()
})

// 设置IPC处理程序
function setupIpcHandlers() {
  // 获取所有项目
  ipcMain.handle("get-projects", () => {
    return readProjectsConfig()
  })

  // 保存项目配置
  ipcMain.handle("save-projects", (event, config) => {
    return saveProjectsConfig(config)
  })

  // 选择项目目录
  ipcMain.handle("select-project-directory", async () => {
    if (!mainWindow) return null

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"]
    })

    if (result.canceled || !result.filePaths.length) {
      return null
    }

    const selectedDir = result.filePaths[0]
    const config = readProjectsConfig()

    // 检查是否已经添加过
    if (config.projectDirectories.includes(selectedDir)) {
      return { success: false, message: "该目录已添加" }
    }

    // 添加到配置
    config.projectDirectories.push(selectedDir)

    // 扫描该目录下的前端项目
    const projects = scanForProjects(selectedDir)
    config.projects = [...config.projects, ...projects]

    // 保存配置
    const success = saveProjectsConfig(config)
    return { success, directory: selectedDir, projects }
  })

  // 打开项目
  ipcMain.handle("open-project", async (event, projectPath) => {
    try {
      const { exec } = await import("child_process")
      exec(`cursor ${projectPath}`, (error) => {
        if (error) {
          console.error(`执行命令时出错: ${error}`)
          return false
        }
      })
      return true
    } catch (error) {
      console.error("打开项目失败:", error)
      return false
    }
  })
}

// 扫描目录下的前端项目
function scanForProjects(directoryPath) {
  const projects = []

  try {
    const items = fs.readdirSync(directoryPath, { withFileTypes: true })

    for (const item of items) {
      if (item.isDirectory()) {
        const projectPath = path.join(directoryPath, item.name)

        // 检查是否是前端项目
        if (isJavaScriptProject(projectPath)) {
          projects.push({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: item.name,
            path: projectPath,
            type: detectProjectType(projectPath)
          })
        }
      }
    }
  } catch (error) {
    console.error(`扫描目录失败 ${directoryPath}:`, error)
  }

  return projects
}

// 检查是否是JavaScript/前端项目
function isJavaScriptProject(projectPath) {
  const indicators = [
    "package.json",
    "node_modules",
    "webpack.config.js",
    "vite.config.js",
    "vite.config.ts",
    "next.config.js",
    "angular.json",
    ".eslintrc"
  ]

  return indicators.some((file) => fs.existsSync(path.join(projectPath, file)))
}

// 检测项目类型
function detectProjectType(projectPath) {
  try {
    if (fs.existsSync(path.join(projectPath, "package.json"))) {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(projectPath, "package.json"), "utf8")
      )

      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      }

      if (dependencies.react) return "React"
      if (dependencies.vue) return "Vue"
      if (dependencies.angular) return "Angular"
      if (dependencies.next) return "Next.js"
      if (dependencies.nuxt) return "Nuxt.js"
    }

    return "JavaScript"
  } catch (error) {
    return "JavaScript"
  }
}

// 所有窗口关闭时退出应用
app.on("window-all-closed", function () {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出
  // 否则绝大部分应用及其菜单栏会保持激活
  if (process.platform !== "darwin") app.quit()
})

app.on("activate", function () {
  // 在 macOS 上，当点击 dock 图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口
  if (mainWindow === null) createWindow()
})
