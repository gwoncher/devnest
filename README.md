# DevNest - Project Manager Application

## Project Architecture

DevNest is a desktop application built with Electron and React, designed to manage and organize local development projects. The application uses the following technology stack:

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **UI Component Library**: Ant Design 5
- **Desktop Framework**: Electron 37
- **Development Tools**: ESLint 9, TypeScript 5.8

The project follows a modular design, divided into these main components:

1. **Electron Main Process**: Responsible for file system operations, project configuration management, and communication with the renderer process
2. **React Renderer Process**: Handles the user interface display and interactions
3. **IPC Communication Layer**: Securely connects the main process and renderer process through a preload script

## Getting Started

The project offers multiple startup methods for different development and production needs:

1. **Development Mode**:
   ```
   npm run electron:dev
   ```
   Simultaneously launches the Vite development server and Electron application with hot reload support

2. **Frontend Development Only**:
   ```
   npm run dev
   ```
   Starts only the Vite development server for frontend development

3. **Preview Production Version**:
   ```
   npm run electron:preview
   ```
   Builds the application and launches Electron in production mode

4. **Build Application**:
   ```
   npm run electron:build
   ```
   Creates a distributable desktop application, output to the dist_electron directory

## Features

DevNest aims to solve the pain points of frontend developers who frequently switch between different projects, offering these core features:

### Project Management
- **Project List Display**: Clearly shows all added frontend projects, with directory grouping support
- **Project Search**: Quickly find specific projects (by name or path)
- **Project Pinning**: Pin frequently used projects for quick access
- **Project Classification**: Automatically identifies project types (React, Vue, Angular, etc.)

### Project Operations
- **One-Click Launch**: Directly open selected projects with the Cursor editor
- **Project Addition**: Select and add existing project directories through a file dialog
- **Project Creation**: Support for creating new projects in specified directories (feature in development)

### Global Keyboard Shortcuts
- **Quick Project Search**: Press the configurable global keyboard shortcut to instantly open a search dialog from anywhere in your system
- **Keyboard Navigation**: Use arrow keys to navigate search results and Enter to launch the selected project
- **Customizable Shortcut**: Configure your preferred keyboard shortcut through the settings panel

### Data Persistence
- **Configuration Storage**: Automatically saves project configurations to the user data directory
- **Project Scanning**: Automatically scans added directories to identify frontend projects

### User Interface
- **Directory Grouping**: Organizes projects by directory with quick switching
- **Card View**: Displays project information in card format
- **Responsive Design**: Adapts to different window sizes

DevNest significantly improves developer efficiency in multi-project environments by providing a centralized interface to manage, launch, and organize all local frontend projects.
