import { List, Empty, Spin } from "antd";
import { memo } from "react";
import type { Project } from "../../types/project";
import ProjectCard from "./ProjectCard";

interface ProjectListProps {
  projects: Project[];
  loading: boolean;
  openingProject: string | null;
  searchQuery: string;
  onOpenProject: (project: Project) => void;
  onTogglePin: (project: Project, e?: React.MouseEvent) => void;
}

// 使用memo优化项目列表渲染
const ProjectList = memo(
  ({ projects, loading, openingProject, searchQuery, onOpenProject, onTogglePin }: ProjectListProps) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center p-10">
          <Spin size="large" />
        </div>
      );
    }

    if (projects.length === 0) {
      return <Empty description={<span>{searchQuery ? "没有找到匹配的项目" : "暂无项目，请添加项目目录"}</span>} />;
    }

    return (
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
        dataSource={projects}
        renderItem={project => (
          <List.Item key={project.id}>
            <ProjectCard
              project={project}
              openingProject={openingProject}
              onOpenProject={onOpenProject}
              onTogglePin={onTogglePin}
            />
          </List.Item>
        )}
      />
    );
  }
);

export default ProjectList;
