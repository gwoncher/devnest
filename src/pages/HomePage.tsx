import { useState, useEffect, useDeferredValue, memo } from "react"
import {
  Button,
  Card,
  List,
  Empty,
  Spin,
  message,
  Typography,
  Tag,
  Space,
  Input,
  Dropdown,
  Tabs
} from "antd"
import {
  FolderAddOutlined,
  PlusOutlined,
  CodeOutlined,
  SearchOutlined,
  PushpinOutlined,
  PushpinFilled,
  MoreOutlined
} from "@ant-design/icons"
import type {
  Project,
  ProjectConfig,
  SelectDirectoryResult
} from "../types/project"

const { Title, Text } = Typography
const { Search } = Input
const { TabPane } = Tabs

// 使用memo优化项目列表渲染
const ProjectListMemo = memo(
  ({
    projects,
    openingProject,
    handleOpenProject,
    handleTogglePin
  }: {
    projects: Project[]
    openingProject: string | null
    handleOpenProject: (project: Project) => void
    handleTogglePin: (project: Project, e?: React.MouseEvent) => void
  }) => {
    return (
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
        dataSource={projects}
        renderItem={(project) => (
          <List.Item key={project.id}>
            <Card
              hoverable
              title={
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {project.pinned && (
                      <PushpinFilled
                        style={{ color: "#1890ff", marginRight: 8 }}
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
                          icon: project.pinned ? (
                            <PushpinFilled />
                          ) : (
                            <PushpinOutlined />
                          ),
                          label: project.pinned ? "取消置顶" : "置顶",
                          onClick: (e) => {
                            e.domEvent.stopPropagation()
                            e.domEvent.nativeEvent.stopPropagation()
                            handleTogglePin(project)
                          }
                        }
                      ]
                    }}
                    placement="bottomRight"
                    trigger={["hover"]}
                  >
                    <MoreOutlined className="cursor-pointer" />
                  </Dropdown>
                </>
              }
              onClick={() => handleOpenProject(project)}
              loading={openingProject === project.id}
              className={project.pinned ? "border-blue-400 border-2" : ""}
            >
              <div className="flex items-center justify-between">
                <Text type="secondary" ellipsis={{ tooltip: project.path }}>
                  {project.path}
                </Text>
              </div>
            </Card>
          </List.Item>
        )}
      />
    )
  }
)

const HomePage = () => {
  const [loading, setLoading] = useState(true)
  const [projectConfig, setProjectConfig] = useState<ProjectConfig>({
    projectDirectories: [],
    projects: []
  })
  const [openingProject, setOpeningProject] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<string>("all")

  // 使用useDeferredValue延迟处理搜索查询，不阻塞UI渲染
  const deferredSearchQuery = useDeferredValue(searchQuery)

  // 获取项目列表
  const fetchProjects = async () => {
    try {
      setLoading(true)
      const config = await window.electron?.getProjects()
      setProjectConfig(config || { projectDirectories: [], projects: [] })

      // 如果有项目目录，默认选择第一个目录作为激活的Tab
      if ((config?.projectDirectories || []).length > 0) {
        setActiveTab(config?.projectDirectories[0] || "all")
      }
    } catch (error) {
      console.error("获取项目失败:", error)
      message.error("获取项目列表失败")
    } finally {
      setLoading(false)
    }
  }

  // 选择项目目录
  const handleSelectDirectory = async () => {
    try {
      setLoading(true)
      const result = (await window.electron?.selectProjectDirectory()) as
        | SelectDirectoryResult
        | undefined

      if (!result) {
        message.info("未选择目录")
        return
      }

      if (!result.success) {
        message.warning(result.message || "添加目录失败")
        return
      }

      message.success(`成功添加目录: ${result.directory}`)
      await fetchProjects()

      // 添加成功后切换到新添加的目录Tab
      if (result.directory) {
        setActiveTab(result.directory)
      }
    } catch (error) {
      console.error("选择目录失败:", error)
      message.error("添加项目目录失败")
    } finally {
      setLoading(false)
    }
  }

  // 打开项目
  const handleOpenProject = async (project: Project) => {
    try {
      setOpeningProject(project.id)
      const success = await window.electron?.openProject(project.path)

      if (success) {
        message.success(`正在使用 Cursor 打开项目: ${project.name}`)
      } else {
        message.error("打开项目失败，请确保已安装 Cursor")
      }
    } catch (error) {
      console.error("打开项目失败:", error)
      message.error("打开项目失败")
    } finally {
      setOpeningProject(null)
    }
  }

  // 搜索项目
  const handleSearch = (value: string) => {
    setSearchQuery(value)
  }

  // 创建新项目
  const handleCreateProject = () => {
    // 获取当前选中的目录
    const targetDirectory = activeTab === "all" ? undefined : activeTab

    message.info(`将在${targetDirectory || "默认位置"}创建新项目`)
    // 这里添加创建项目的逻辑
  }

  // 切换项目置顶状态
  const handleTogglePin = async (project: Project, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation() // 阻止事件冒泡，避免触发卡片的点击事件
    }

    try {
      const updatedProjects = projectConfig.projects.map((p) => {
        if (p.id === project.id) {
          return { ...p, pinned: !p.pinned }
        }
        return p
      })

      const updatedConfig = {
        ...projectConfig,
        projects: updatedProjects
      }

      // 保存更新后的项目配置
      await window.electron?.saveProjects(updatedConfig)
      setProjectConfig(updatedConfig)

      message.success(
        `${project.pinned ? "取消置顶" : "置顶"}项目: ${project.name}`
      )
    } catch (error) {
      console.error("更新项目失败:", error)
      message.error("操作失败")
    }
  }

  // Tab切换处理
  const handleTabChange = (key: string) => {
    setActiveTab(key)
  }

  // 根据当前选择的Tab和搜索条件过滤项目
  const getFilteredProjects = () => {
    // 首先根据搜索条件过滤
    const searchFiltered = deferredSearchQuery
      ? projectConfig.projects.filter(
          (project) =>
            project.name
              .toLowerCase()
              .includes(deferredSearchQuery.toLowerCase()) ||
            project.path
              .toLowerCase()
              .includes(deferredSearchQuery.toLowerCase())
        )
      : projectConfig.projects

    // 然后根据当前选择的Tab进一步过滤
    if (activeTab === "all") {
      return searchFiltered
    } else {
      // 过滤出属于当前目录的项目
      return searchFiltered.filter((project) =>
        project.path.startsWith(activeTab)
      )
    }
  }

  // 获取过滤后的项目并排序
  const filteredProjects = getFilteredProjects()

  // 排序项目，置顶的排在前面
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return 0
  })

  // 首次加载时获取项目列表
  useEffect(() => {
    fetchProjects()
  }, [])

  // 渲染Tab内容
  const renderTabContent = () => {
    return (
      <>
        <div className="flex justify-end mb-4">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateProject}
          >
            在{activeTab === "all" ? "默认位置" : "此目录"}创建新项目
          </Button>
        </div>
        {renderProjects()}
      </>
    )
  }

  // 渲染项目列表
  const renderProjects = () => {
    if (loading) {
      return <Spin size="large" className="my-8" />
    }

    if (projectConfig.projects.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无项目，请添加项目目录"
          className="my-8"
        >
          <Button
            type="primary"
            icon={<FolderAddOutlined />}
            onClick={handleSelectDirectory}
          >
            添加项目目录
          </Button>
        </Empty>
      )
    }

    if (filteredProjects.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="没有找到匹配的项目"
          className="my-8"
        />
      )
    }

    // 使用memo组件渲染项目列表
    return (
      <ProjectListMemo
        projects={sortedProjects}
        openingProject={openingProject}
        handleOpenProject={handleOpenProject}
        handleTogglePin={handleTogglePin}
      />
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>我的前端项目</Title>
        <Button icon={<FolderAddOutlined />} onClick={handleSelectDirectory}>
          添加项目目录
        </Button>
      </div>

      <div className="mb-4">
        <Search
          placeholder="搜索项目名称或路径"
          allowClear
          enterButton={<SearchOutlined />}
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ maxWidth: "400px" }}
        />
      </div>

      {projectConfig.projectDirectories.length > 0 ? (
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          type="card"
          items={[
            {
              key: "all",
              label: "全部项目",
              children: renderTabContent()
            },
            ...projectConfig.projectDirectories.map((dir) => ({
              key: dir,
              label: (
                <span>
                  <CodeOutlined className="mr-1" />
                  {dir.split("/").pop() || dir}
                </span>
              ),
              children: renderTabContent()
            }))
          ]}
        />
      ) : (
        renderProjects()
      )}
    </div>
  )
}

export default HomePage
