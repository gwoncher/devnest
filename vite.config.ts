import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { resolve } from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  resolve: {
    alias: {
      "@": resolve(__dirname, "src")
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5173
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"]
        }
      }
    }
  }
})
