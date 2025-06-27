/*
 * @Author: quanzhe
 * @Date: 2025-06-27 13:34:20
 * @LastEditors: quanzhe
 * @LastEditTime: 2025-06-27 14:25:30
 * @Description:
 */

import { app, BrowserWindow } from "electron"

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  })

  win.loadFile("index.html")
}

app.whenReady().then(() => {
  createWindow()
})
