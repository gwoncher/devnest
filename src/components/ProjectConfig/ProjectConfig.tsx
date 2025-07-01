import { Button, Modal, Select, Tooltip, type SelectProps } from "antd";
import { EditorType } from "../../types/enum";
import type { AppConfig } from "../../types/project";
import { SettingOutlined } from "@ant-design/icons";
import AppInfo from "../AppInfo";
import type { AppInfo as AppInfoType } from "../../types/project";

const { Option } = Select;

interface ProjectConfigProps {
  appConfig: AppConfig;
  appInfo: AppInfoType | null;
  settingsVisible: boolean;
  onSettingsVisibleChange: (visible: boolean) => void;
  onEditorChange: SelectProps["onChange"];
}

const ProjectConfig = ({
  appConfig,
  appInfo,
  settingsVisible,
  onSettingsVisibleChange,
  onEditorChange,
}: ProjectConfigProps) => {
  return (
    <>
      <Tooltip title="设置">
        <Button icon={<SettingOutlined />} onClick={() => onSettingsVisibleChange(true)} />
      </Tooltip>
      <Modal title="设置" open={settingsVisible} onCancel={() => onSettingsVisibleChange(false)} footer={null}>
        <div className="mb-4">
          <div className="mb-2">默认编辑器</div>
          <Select value={appConfig.defaultEditor} onChange={onEditorChange} style={{ width: "100%" }}>
            {Object.values(EditorType).map(editor => (
              <Option key={editor} value={editor}>
                {editor}
              </Option>
            ))}
          </Select>
        </div>

        <AppInfo appInfo={appInfo} />
      </Modal>
    </>
  );
};

export default ProjectConfig;
