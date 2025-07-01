import { Typography } from "antd";
import type { AppInfo as AppInfoType } from "../../types/project";

const { Title, Text } = Typography;

interface AppInfoProps {
  appInfo: AppInfoType | null;
}

const AppInfo = ({ appInfo }: AppInfoProps) => {
  if (!appInfo) return null;

  return (
    <div className="mt-4">
      <Title level={5}>应用信息</Title>
      <div>
        <Text type="secondary">版本: </Text>
        <Text>{appInfo.appVersion}</Text>
      </div>
      <div>
        <Text type="secondary">Electron: </Text>
        <Text>{appInfo.electronVersion}</Text>
      </div>
      <div>
        <Text type="secondary">Node: </Text>
        <Text>{appInfo.nodeVersion}</Text>
      </div>
      <div>
        <Text type="secondary">平台: </Text>
        <Text>{appInfo.platform}</Text>
      </div>
    </div>
  );
};

export default AppInfo;
