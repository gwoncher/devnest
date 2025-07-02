import { Button, Modal, Select, Tooltip, Input, type SelectProps, type InputRef } from "antd";
import { EditorType } from "../../types/enum";
import type { AppConfig } from "../../types/project";
import { SettingOutlined } from "@ant-design/icons";
import type { AppInfo as AppInfoType } from "../../types/project";
import { useState, useRef, useEffect } from "react";

const { Option } = Select;

interface ProjectConfigProps {
  appConfig: AppConfig;
  appInfo: AppInfoType | null;
  settingsVisible: boolean;
  onSettingsVisibleChange: (visible: boolean) => void;
  onEditorChange: SelectProps["onChange"];
  onSearchShortcutChange?: (shortcut: string) => Promise<boolean>;
}

const ProjectConfig = ({
  appConfig,
  settingsVisible,
  onSettingsVisibleChange,
  onEditorChange,
  onSearchShortcutChange,
}: ProjectConfigProps) => {
  const [shortcutValue, setShortcutValue] = useState(appConfig.searchShortcut || "");
  const [shortcutSaving, setShortcutSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const shortcutInputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (!settingsVisible) {
      setShortcutValue(appConfig.searchShortcut || "");
      setIsListening(false);
    }
  }, [settingsVisible, appConfig.searchShortcut]);

  // 处理键盘监听
  useEffect(() => {
    if (!isListening) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();

      // 获取按键组合
      const modifiers = [];
      if (e.metaKey) modifiers.push("Command");
      if (e.ctrlKey) modifiers.push("Control");
      if (e.altKey) modifiers.push("Alt");
      if (e.shiftKey) modifiers.push("Shift");

      // 只有当有修饰键和普通键时才设置快捷键
      if (modifiers.length > 0 && e.key && !["Meta", "Control", "Alt", "Shift"].includes(e.key)) {
        const keyName = e.key.length === 1 ? e.key.toUpperCase() : e.key;
        const shortcut = [...modifiers, keyName].join("+");
        setShortcutValue(shortcut);
        setIsListening(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isListening]);

  const startListening = () => {
    setIsListening(true);
    if (shortcutInputRef.current) {
      shortcutInputRef.current.focus();
    }
  };

  const handleSaveShortcut = async () => {
    if (onSearchShortcutChange) {
      setShortcutSaving(true);
      try {
        await onSearchShortcutChange(shortcutValue);
      } finally {
        setShortcutSaving(false);
      }
    }
  };

  const handleBlur = () => {
    setIsListening(false);
  };

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

        <div className="mb-4">
          <div className="mb-2">搜索快捷键</div>
          <div className="flex space-x-2">
            <Input
              ref={shortcutInputRef}
              onBlur={handleBlur}
              value={isListening ? "请按下快捷键组合..." : shortcutValue}
              readOnly
              onClick={startListening}
              className={isListening ? "bg-gray-100" : ""}
              placeholder="点击此处设置快捷键"
            />
            <Button type="primary" onClick={handleSaveShortcut} loading={shortcutSaving}>
              保存
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-1">点击输入框并按下快捷键组合进行设置</div>
        </div>
      </Modal>
    </>
  );
};

export default ProjectConfig;
