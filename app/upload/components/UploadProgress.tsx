"use client";

import { cn } from "@/lib/utils";
import type { UploadState } from "../upload-constants";
import { clampPercentage } from "../upload-utils";
import { FaCheck } from "react-icons/fa";

export type UploadProgressProps = {
  state: UploadState;
  progress: number;
  error?: string | null;
  labels?: {
    idle?: string;
    uploading?: string;
    done?: string;
    error?: string;
  };
  doneMessage?: string | null;
};

export default function UploadProgress({
  state,
  progress,
  error,
  labels,
  doneMessage,
}: UploadProgressProps) {
  const resolvedLabels = {
    idle: "Ready to upload",
    uploading: "Uploading",
    done: "Upload complete",
    error: "Upload failed",
    ...labels,
  };
  const statusLabel = resolvedLabels[state] ?? resolvedLabels.idle;
  const clampedProgress = clampPercentage(
    Number.isFinite(progress) ? progress : 0
  );

  const barColor =
    state === "error"
      ? "bg-red-500"
      : state === "done"
        ? "bg-green-500"
        : "bg-accent";

  const resolvedDoneMessage = doneMessage ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span
          className={cn(
            "font-semibold",
            state === "error"
              ? "text-red-400"
              : state === "done"
                ? "text-green-400"
                : "text-text"
          )}
        >
          {statusLabel}
        </span>
        <span className="text-text-amount">{Math.round(clampedProgress)}%</span>
      </div>
      <div
        className="h-2 rounded-full bg-border/60 overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(clampedProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-300", barColor)}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      {state === "done" && resolvedDoneMessage && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border/60 bg-container-dark/60 p-6">
          <div className="text-6xl font-black text-green-400"><FaCheck /></div>
          <p className="mt-3 text-sm text-text-amount">{resolvedDoneMessage}</p>
        </div>
      )}

      {state === "error" && error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
