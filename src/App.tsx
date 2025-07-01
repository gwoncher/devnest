import "./App.css";
import "./index.css";
import { Layout, ConfigProvider, theme, Button, Tooltip } from "antd";
import HomePage from "./pages/HomePage";
import { useThemeStore } from "./store";
import { BulbOutlined, BulbFilled } from "@ant-design/icons";

const { Header, Content, Footer } = Layout;

// 定义 electron 接口类型

function App() {
  const { themeMode, toggleThemeMode } = useThemeStore();

  return (
    <ConfigProvider
      theme={{
        algorithm: themeMode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1677ff",
        },
      }}>
      <Layout className="min-h-screen">
        <Header className="flex items-center justify-between">
          <h1 className="text-white text-xl m-0">DevNest</h1>
          <Tooltip title={themeMode === "dark" ? "切换到亮色模式" : "切换到暗色模式"}>
            <Button
              type="text"
              icon={themeMode === "dark" ? <BulbOutlined /> : <BulbFilled />}
              onClick={toggleThemeMode}
              style={{ color: "white" }}
            />
          </Tooltip>
        </Header>
        <Content className="bg-background">
          <HomePage />
        </Content>
        <Footer className="text-center">DevNest ©{new Date().getFullYear()} Created with Electron + React</Footer>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
