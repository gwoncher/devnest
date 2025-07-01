import { Card, Dropdown, Tag, Typography } from "antd";
import { MoreOutlined, PushpinFilled, PushpinOutlined } from "@ant-design/icons";
import type { Project } from "../../types/project";
import { memo } from "react";

const { Text } = Typography;

interface ProjectCardProps {
  project: Project;
  openingProject: string | null;
  onOpenProject: (project: Project) => void;
  onTogglePin: (project: Project, e?: React.MouseEvent) => void;
}

// 使用 memo 优化项目卡片渲染
const ProjectCard = ({ project, openingProject, onOpenProject, onTogglePin }: ProjectCardProps) => {
  return (
    <Card
      hoverable
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {project.pinned && (
              <PushpinFilled
                style={{
                  color: "#1890ff",
                  marginRight: 8,
                }}
              />
            )}
            <span>{project.name}</span>
          </div>
        </div>
      }
      extra={
        <>
          <Tag color="default">{project.type}</Tag>
          <Dropdown
            menu={{
              items: [
                {
                  key: "pin",
                  icon: project.pinned ? <PushpinFilled /> : <PushpinOutlined />,
                  label: project.pinned ? "取消置顶" : "置顶",
                  onClick: e => {
                    e.domEvent.stopPropagation();
                    e.domEvent.nativeEvent.stopPropagation();
                    onTogglePin(project);
                  },
                },
              ],
            }}
            placement="topLeft"
            trigger={["hover"]}>
            <MoreOutlined className="cursor-pointer" />
          </Dropdown>
        </>
      }
      onClick={() => onOpenProject(project)}
      loading={openingProject === project.id}
      className={project.pinned ? "border-blue-400 border-2" : ""}>
      <div className="flex items-center justify-between">
        <Text type="secondary" ellipsis={{ tooltip: project.path }}>
          {project.path}
        </Text>
      </div>
    </Card>
  );
};

export default memo(ProjectCard);
