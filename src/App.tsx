import { Layout, ConfigProvider, theme, Button, Tooltip } from "antd";
import { BulbOutlined, BulbFilled } from "@ant-design/icons";
import { RouterProvider, createHashRouter } from "react-router";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import { useThemeStore } from "./store";
import "./App.css";
import "./index.css";

const { Header, Content, Footer } = Layout;

function App() {
  const { themeMode, toggleThemeMode } = useThemeStore();
  console.log(window.location.href);

  const router = createHashRouter([
    {
      path: "/",
      element: (
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
      ),
    },
    {
      path: "/search",
      element: <SearchPage />,
    },
  ]);

  return (
    <ConfigProvider
      theme={{
        algorithm: themeMode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1677ff",
        },
      }}>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default App;
