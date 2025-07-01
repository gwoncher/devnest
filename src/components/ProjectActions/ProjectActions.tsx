import { Button } from "antd";
import { FolderAddOutlined, PlusOutlined } from "@ant-design/icons";

interface ProjectActionsProps {
  loading: boolean;
  onAddDirectory: () => void;
  onCreateProject: () => void;
}

const ProjectActions = ({ loading, onAddDirectory, onCreateProject }: ProjectActionsProps) => {
  return (
    <div className="flex items-center">
      <Button type="primary" icon={<FolderAddOutlined />} onClick={onAddDirectory} loading={loading}>
        添加分组
      </Button>
      <Button className="ml-2" icon={<PlusOutlined />} onClick={onCreateProject}>
        创建项目
      </Button>
    </div>
  );
};

export default ProjectActions;
