import { Alert } from "antd";
import type { MainProcessError } from "../../types/project";

interface ErrorAlertProps {
  error: MainProcessError | null;
}

const ErrorAlert = ({ error }: ErrorAlertProps) => {
  if (!error) return null;

  return <Alert message="主进程错误" description={error.message} type="error" showIcon closable className="mb-4" />;
};

export default ErrorAlert;
