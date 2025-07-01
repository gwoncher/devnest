import { Tabs, Spin } from "antd";
import type { ReactNode } from "react";
import { Suspense, memo } from "react";

interface TabItem {
  key: string;
  label: string;
  children: ReactNode;
}

interface ProjectTabsProps {
  activeTab: string;
  tabItems: TabItem[];
  onChange: (key: string) => void;
}

// 使用 memo 优化 ProjectTabs 组件
const ProjectTabs = memo(({ activeTab, tabItems, onChange }: ProjectTabsProps) => {
  return (
    <Suspense fallback={<Spin size="large" className="flex justify-center my-10" />}>
      <Tabs
        destroyOnHidden={true}
        activeKey={activeTab}
        items={tabItems}
        onChange={onChange}
        className="project-tabs"
        animated={{ tabPane: true }}
      />
    </Suspense>
  );
});

export default ProjectTabs;
