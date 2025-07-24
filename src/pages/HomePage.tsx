import { useEffect } from "react";
import { message } from "antd";
import type { Project } from "../types/project";
import { EditorType } from "../types/enum";
import { useProjectStore, useConfigStore, useAppStore } from "../store";
import { ProjectSearch, ProjectList, ProjectTabs, ProjectActions, ProjectConfig, ErrorAlert } from "../components";
import { useMemoizedFn } from "ahooks";

const HomePage = () => {
  // 从 Zustand store 获取状态和操作
  const {
    loading,
    openingProject,
    activeTab,
    searchQuery,
    setSearchQuery,
    initProject,
    selectProjectDirectory,
    openProject,
    togglePinProject,
    getFilteredProjects,
    setGroupOrder,
    refreshAllDirectories,
  } = useProjectStore();

  const { appConfig, settingsVisible, setSettingsVisible, fetchAppConfig, setDefaultEditor, setSearchShortcut } =
    useConfigStore();

  const { appInfo, mainProcessError, fetchAppInfo, setupErrorListener } = useAppStore();

  // 初始化
  useEffect(() => {
    // 设置错误监听器
    setupErrorListener();

    // 获取项目列表
    initProject();

    // 获取应用配置
    fetchAppConfig();

    // 获取应用信息
    fetchAppInfo();
  }, [initProject, fetchAppConfig, fetchAppInfo, setupErrorListener]);

  const handleCreateProject = () => {
    // 创建项目的逻辑
    message.info("创建项目功能开发中");
  };

  const handleTogglePin = useMemoizedFn(async (project: Project, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    try {
      await togglePinProject(project);
      message.success(`${project.pinned ? "取消置顶" : "置顶"}项目: ${project.name}`);
    } catch (error) {
      console.error("置顶项目失败:", error);
      message.error("操作失败");
    }
  });

  const handleEditorChange = useMemoizedFn((value: EditorType) => {
    setDefaultEditor(value).then(success => {
      if (success) {
        message.success(`已设置默认编辑器为: ${value}`);
      } else {
        message.error("设置默认编辑器失败");
      }
    });
  });

  const handleSearchShortcutChange = useMemoizedFn(async (shortcut: string) => {
    const success = await setSearchShortcut(shortcut);
    if (success) {
      message.success(`已设置搜索快捷键为: ${shortcut}`);
    } else {
      message.error("设置搜索快捷键失败");
    }
    return success;
  });

  const handleGroupOrderChange = useMemoizedFn((items: string[]) => {
    setGroupOrder(items);
  });

  const handleRefreshTab = useMemoizedFn(async () => {
    try {
      const result = await refreshAllDirectories();
      if (result.success) {
        message.success(result.message);
      } else {
        message.error(result.message);
      }
    } catch (error) {
      console.error("刷新标签页失败:", error);
      message.error("刷新失败");
    }
  });

  // 准备标签页数据
  const tabItems = [
    ...(getFilteredProjects() || []).map(data => ({
      key: data.key,
      label: data.label,
      children: (
        <ProjectList
          projects={data.projects}
          loading={loading}
          openingProject={openingProject}
          searchQuery={searchQuery}
          onOpenProject={openProject}
          onTogglePin={handleTogglePin}
        />
      ),
    })),
  ];

  return (
    <div className="container mx-auto p-4">
      <ErrorAlert error={mainProcessError} />

      <div className="flex justify-between items-center mb-4">
        <ProjectActions
          loading={loading}
          onAddDirectory={selectProjectDirectory}
          onCreateProject={handleCreateProject}
        />

        <div className="flex items-center">
          <ProjectSearch onSearch={setSearchQuery} />
          <div className="ml-2">
            <ProjectConfig
              appConfig={appConfig}
              appInfo={appInfo}
              settingsVisible={settingsVisible}
              onSettingsVisibleChange={setSettingsVisible}
              onEditorChange={handleEditorChange}
              onSearchShortcutChange={handleSearchShortcutChange}
            />
          </div>
        </div>
      </div>

      <ProjectTabs
        activeTab={activeTab}
        tabItems={tabItems}
        onSortEnd={handleGroupOrderChange}
        onRefreshTab={handleRefreshTab}
      />
    </div>
  );
};

export default HomePage;
