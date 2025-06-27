import "./App.css";
import "./index.css";
import { Layout, ConfigProvider, theme } from "antd";
import HomePage from "./pages/HomePage";

const { Header, Content, Footer } = Layout;

// 定义 electron 接口类型

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#1677ff",
        },
      }}>
      <Layout className="min-h-screen">
        <Header className="flex items-center">
          <h1 className="text-white text-xl m-0">前端项目管理器</h1>
        </Header>
        <Content className="bg-background">
          <HomePage />
        </Content>
        <Footer className="text-center">
          前端项目管理器 ©{new Date().getFullYear()} Created with Electron + React
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
