import { ToastType } from "@/types/schema";

let toastFn: ((message: string, type?: ToastType) => void) | null = null;

export function registerToast(fn: typeof toastFn) {
  toastFn = fn;
}

export const toast = {
  success: (msg: string) => toastFn?.(msg, "success"),
  error: (msg: string) => toastFn?.(msg, "error"),
  warning: (msg: string) => toastFn?.(msg, "warning"),
  info: (msg: string) => toastFn?.(msg, "info"),
};