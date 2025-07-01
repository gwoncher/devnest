import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useDeferredValue, useEffect, useState } from "react";
import { useDebounce } from "ahooks";

interface ProjectSearchProps {
  onSearch: (value: string) => void;
}

const ProjectSearch = ({ onSearch }: ProjectSearchProps) => {
  const [inputValue, setInputValue] = useState("");

  const debouncedInputValue = useDebounce(inputValue, { wait: 200 });
  const deferredInputValue = useDeferredValue(debouncedInputValue);

  useEffect(() => {
    onSearch(deferredInputValue);
  }, [deferredInputValue, onSearch]);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
  };

  return (
    <Input
      placeholder="搜索项目..."
      prefix={<SearchOutlined />}
      value={inputValue}
      onChange={handleInputChange}
      className="w-64"
      allowClear
    />
  );
};

export default ProjectSearch;
