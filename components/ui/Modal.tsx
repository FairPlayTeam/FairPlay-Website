"use client";

import { useEffect, useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  title?: string;
  description?: ReactNode;
  children?: ReactNode;
  onClose: () => void;
  className?: string;
  showCloseButton?: boolean;
}

export default function Modal({
  isOpen,
  title,
  description,
  children,
  onClose,
  className,
  showCloseButton = false,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/10 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 flex min-h-[100dvh] items-end justify-center md:p-4 sm:items-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descriptionId : undefined}
          className={cn(
            "w-full max-w-lg rounded-t-2xl border border-border bg-(--gray-900) shadow-2xl sm:rounded-2xl",
            "max-h-[85vh] overflow-y-auto",
            className
          )}
        >
          <div className="flex flex-col gap-4 p-5 sm:p-6">
            {title || description || showCloseButton ? (
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  {title ? (
                    <h2
                      id={titleId}
                      className="text-lg font-semibold text-text mb-3"
                    >
                      {title}
                    </h2>
                  ) : null}
                  {description ? (
                    <p id={descriptionId} className="text-sm text-text-amount">
                      {description}
                    </p>
                  ) : null}
                </div>
                {showCloseButton ? (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close dialog"
                    className="rounded-full px-2 py-1 text-sm text-text-amount transition-colors hover:text-text"
                  >
                    Close
                  </button>
                ) : null}
              </div>
            ) : null}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
