"use client";

import { cn } from "@/lib/utils";
import type { UploadState } from "../upload-constants";
import { clampPercentage } from "../upload-utils";
import { CheckCircle2, AlertCircle } from "lucide-react";

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
  const clampedProgress = clampPercentage(Number.isFinite(progress) ? progress : 0);
  const isDone = state === "done";
  const isError = state === "error";

  return (
    <div className="space-y-4">
      {isDone ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/40 py-8 px-6 text-center">
          <CheckCircle2 className="size-10 text-primary" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-semibold text-foreground">{statusLabel}</p>
            {doneMessage && <p className="mt-1 text-xs text-muted-foreground">{doneMessage}</p>}
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span
                className={cn("font-semibold", isError ? "text-destructive" : "text-foreground")}
              >
                {statusLabel}
              </span>
              {!isError && (
                <span className="tabular-nums text-muted-foreground">
                  {Math.round(clampedProgress)}%
                </span>
              )}
            </div>

            <div
              className="h-2 rounded-full bg-border overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.round(clampedProgress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  isError ? "bg-destructive" : "bg-primary",
                )}
                style={{ width: `${clampedProgress}%` }}
              />
            </div>
          </div>

          {isError && error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
