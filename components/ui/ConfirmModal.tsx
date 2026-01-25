"use client";

import type { ReactNode } from "react";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

type ConfirmTone = "danger" | "safe" | "accent";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmTone?: ConfirmTone;
  isProcessing?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const toneClasses: Record<ConfirmTone, string> = {
  danger: "border-red-400/40 text-red-400 hover:bg-red-400/10",
  safe: "border-green-400/40 text-green-400 hover:bg-green-400/10",
  accent: "border-accent/60 text-accent hover:bg-accent/10",
};

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmTone = "accent",
  isProcessing = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      description={description}
      onClose={onCancel}
    >
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="download"
          onClick={onCancel}
          disabled={isProcessing}
          className="w-full rounded-md border border-border/60 px-4 py-2 text-sm text-text transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant="download"
          onClick={onConfirm}
          disabled={isProcessing}
          className={cn(
            "w-full rounded-md border px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto",
            toneClasses[confirmTone]
          )}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
