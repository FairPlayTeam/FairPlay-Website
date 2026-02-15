"use client";

import { useEffect, useId, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full flex min-h-screen items-end justify-center md:p-4 sm:items-center pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? titleId : undefined}
              aria-describedby={description ? descriptionId : undefined}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                type: "spring",
                duration: 0.4,
                bounce: 0.2
              }}
              className={cn(
                "w-full max-w-lg rounded-t-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl sm:rounded-2xl pointer-events-auto",
                "max-h-[85vh] overflow-hidden flex flex-col",
                className
              )}
            >
              <div className="flex flex-col gap-4 p-5 sm:p-6 overflow-hidden">
                {title || description || showCloseButton ? (
                  <div className="flex items-start justify-between gap-4 shrink-0">
                    <div className="space-y-1">
                      {title ? (
                        <h2
                          id={titleId}
                          className="text-lg font-bold text-text mb-1"
                        >
                          {title}
                        </h2>
                      ) : null}
                      {description ? (
                        <p id={descriptionId} className="text-sm text-muted-foreground">
                          {description}
                        </p>
                      ) : null}
                    </div>
                    {showCloseButton ? (
                      <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close dialog"
                        className="rounded-full flex items-center justify-center size-8 bg-white/5 text-muted-foreground transition-all hover:text-text hover:bg-white/10 cursor-pointer"
                      >
                        <span className="text-xl leading-none">&times;</span>
                      </button>
                    ) : null}
                  </div>
                ) : null}
                <div className="overflow-y-auto flex-1 h-full min-h-0">
                  {children}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
