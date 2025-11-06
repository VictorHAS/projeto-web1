import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

interface FeedbackBannerProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  onClose?: () => void;
}

export function FeedbackBanner({ type, message, onClose }: FeedbackBannerProps) {
  const styles = {
    success: "bg-success/10 text-success border-success/20",
    error: "bg-destructive/10 text-destructive border-destructive/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    info: "bg-info/10 text-info border-info/20",
  };

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const Icon = icons[type];

  return (
    <div className={`flex items-center gap-3 p-4 rounded-md border ${styles[type]}`}>
      <Icon className="w-5 h-5 shrink-0" />
      <p className="flex-1">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 hover:opacity-70 transition-opacity"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
