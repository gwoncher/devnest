import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { Tabs, Spin, Button } from "antd";
import type { ReactNode } from "react";
import { Suspense, memo } from "react";
import { MenuOutlined, ReloadOutlined } from "@ant-design/icons";
import { CSS } from "@dnd-kit/utilities";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";

interface TabItem {
  key: string;
  label: string;
  children: ReactNode;
}

interface ProjectTabsProps {
  activeTab: string;
  tabItems: TabItem[];
  onSortEnd: (items: string[]) => void;
  onRefreshTab?: () => void;
}

function SortableTabItem({ item }: { item: TabItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.key,
    // 这里不需要设置手柄，因为我们会手动将listeners应用到图标上
  });

  const itemStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "pointer", // 整个项目不是拖拽手柄
  };

  const handleStyle = {
    cursor: "move", // 只有图标是拖拽手柄
    marginLeft: "8px",
    color: "#999",
    fontSize: "12px",
  };

  return (
    <div>
      <div ref={setNodeRef} style={itemStyle} {...attributes}>
        <span>{item.label}</span>
        <span style={handleStyle} {...listeners}>
          <MenuOutlined />
        </span>
      </div>
    </div>
  );
}

// 使用 memo 优化 ProjectTabs 组件
const ProjectTabs = memo(({ activeTab, tabItems, onSortEnd, onRefreshTab }: ProjectTabsProps) => {
  // 配置传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // 设置拖动激活约束，避免轻微点击就触发拖动
      activationConstraint: {
        distance: 8, // 8px的移动距离后才激活拖动
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }
    const oldIndex = tabItems.findIndex(item => item.key === active.id);
    const newIndex = tabItems.findIndex(item => item.key === over.id);

    // 使用arrayMove帮助函数重新排序
    const newItems = arrayMove(tabItems, oldIndex, newIndex);
    onSortEnd(newItems.map(item => item.key));
  };

  return (
    <Suspense fallback={<Spin size="large" className="flex justify-center my-10" />}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToHorizontalAxis]}>
        <SortableContext items={tabItems.map(item => item.key)} strategy={horizontalListSortingStrategy}>
          <Tabs
            destroyOnHidden={true}
            defaultActiveKey={activeTab}
            items={tabItems.map(item => ({
              ...item,
              label: <SortableTabItem item={item} />,
            }))}
            className="project-tabs"
            animated={{ tabPane: true }}
            tabBarExtraContent={<Button icon={<ReloadOutlined />} onClick={() => onRefreshTab?.()} />}
          />
        </SortableContext>
      </DndContext>
    </Suspense>
  );
});

export default ProjectTabs;
