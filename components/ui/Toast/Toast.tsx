import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

const typeConfig: Record<
  ToastType,
  {
    icon: React.ReactNode;
    accent: string;
  }
> = {
  success: {
    icon: <FaCheckCircle className="size-5 text-green-400" />,
    accent: "border-green-400/40",
  },
  error: {
    icon: <FaTimesCircle className="size-5 text-red-400" />,
    accent: "border-red-400/40",
  },
  warning: {
    icon: <FaExclamationTriangle className="size-5 text-yellow-400" />,
    accent: "border-yellow-400/40",
  },
  info: {
    icon: <FaInfoCircle className="size-5 text-blue-400" />,
    accent: "border-blue-400/40",
  },
};

export default function Toast({
  message,
  type = "info",
  duration = 5000,
  onClose,
}: ToastProps) {
  const [visible, setVisible] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const enterTimer = setTimeout(() => setFadeIn(true), 10);
    return () => clearTimeout(enterTimer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      const removeTimer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, 300);
      return () => clearTimeout(removeTimer);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const { icon, accent } = typeConfig[type];

  return (
    <div
      role="alert"
      className={`
        flex items-start gap-3
        w-90 max-w-[calc(100vw-2rem)]
        p-4 rounded-xl
        border ${accent}
        bg-background/80 backdrop-blur-md
        shadow-lg shadow-black/20
        text-sm text-foreground
        transition-all duration-300
        ${fadeIn && !fadeOut ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}
      `}
    >
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 leading-snug">{message}</div>
    </div>
  );
}
