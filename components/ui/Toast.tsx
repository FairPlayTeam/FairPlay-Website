import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number; // in ms
  onClose?: () => void;
}

const typeStyles: Record<ToastType, string> = {
  success: "bg-green-500 text-white",
  error: "bg-red-500 text-white",
  warning: "bg-yellow-500 text-black",
  info: "bg-blue-500 text-white",
};

export default function Toast({
  message,
  type = "info",
  duration = 3000,
  onClose,
}: ToastProps) {
  const [visible, setVisible] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const enterTimer = setTimeout(() => setFadeIn(true), 10)
    return () => clearTimeout(enterTimer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      const removeTimer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, 300);
      return () => clearTimeout(removeTimer);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div
      className={`
        fixed bottom-4 right-4 max-w-xs w-full p-4 rounded shadow-lg
        ${typeStyles[type]}
        transition-all duration-300 transform
        ${fadeIn && !fadeOut ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}
        ${fadeOut ? "opacity-0 translate-x-4" : ""}
      `}
      role="alert"
    >
      {message}
    </div>
  );
}