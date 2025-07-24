/*
 * @Author: quanzhe
 * @Date: 2025-07-02 14:40:56
 * @LastEditors: quanzhe
 * @LastEditTime: 2025-07-09 10:22:53
 * @Description:
 */

import React, { useState, useEffect, useRef, useDeferredValue } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { useProjectStore, useThemeStore } from "../../store";
import type { Project } from "../../types/project";
import "./style.css";
import { useDebounce } from "ahooks";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Project[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // 从 store 获取项目列表
  const { fetchProjects, projectConfig } = useProjectStore();
  const { themeMode } = useThemeStore();

  const debouncedInputValue = useDebounce(searchTerm, { wait: 200 });
  const deferredInputValue = useDeferredValue(debouncedInputValue);

  useEffect(() => {
    fetchProjects();
    // 聚焦搜索框
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [fetchProjects]);

  // 重置选中索引当结果变化时
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // 处理搜索
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setShowDropdown(false);
      return;
    }
  };

  useEffect(() => {
    const filteredResults = projectConfig.projects.filter(item =>
      item.name.toLowerCase().includes(deferredInputValue.toLowerCase())
    );
    if (deferredInputValue.trim() !== "") {
      setShowDropdown(true);
    }
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
    });
    setResults(filteredResults);
  }, [deferredInputValue, projectConfig.projects]);

  // 处理项目选择
  const handleSelectProject = async (project: Project) => {
    try {
      // 使用 Electron API 打开项目
      if (window.electron) {
        const success = await window.electron.openProject(project.path);
        if (success) {
          console.log(`成功打开项目: ${project.name}`);
          window.electron.closeSearchWindow();
        } else {
          console.error(`打开项目失败: ${project.name}`);
        }
      }
    } catch (error) {
      console.error("打开项目时出错:", error);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowDropdown(false);
    } else if (e.key === "ArrowDown" && showDropdown && results.length > 0) {
      // 向下移动选择
      e.preventDefault();
      setSelectedIndex(prevIndex => (prevIndex < results.length - 1 ? prevIndex + 1 : prevIndex));
    } else if (e.key === "ArrowUp" && showDropdown && results.length > 0) {
      // 向上移动选择
      e.preventDefault();
      setSelectedIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : 0));
    } else if (e.key === "Enter" && showDropdown && results.length > 0) {
      // 按回车键选择当前选中的结果
      e.preventDefault();
      handleSelectProject(results[selectedIndex]);
    }
  };

  const handleBlur = () => {
    if (window.electron) {
      window.electron.closeSearchWindow();
    }
  };

  return (
    <div className="search-page" data-theme={themeMode}>
      <div className="search-container">
        <div className="search-icon">
          <SearchOutlined />
        </div>
        <input
          ref={inputRef}
          type="text"
          className="search-box"
          placeholder="搜索项目..."
          value={searchTerm}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
      </div>
      {showDropdown && (
        <div className="dropdown" onMouseDown={e => e.preventDefault()}>
          {results.length > 0 ? (
            results.map((project, index) => (
              <div
                key={project.id}
                className={`dropdown-item ${index === selectedIndex ? "selected" : ""}`}
                onClick={() => handleSelectProject(project)}>
                <div className="font-medium">{project.name}</div>
                <div className="text-sm text-gray-500">{project.path}</div>
              </div>
            ))
          ) : (
            <div className="no-results">未找到匹配的项目</div>
          )}
        </div>
      )}
    </div>
  );
}
