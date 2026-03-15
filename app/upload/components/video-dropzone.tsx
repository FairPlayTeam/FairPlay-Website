"use client";

import { CloudUpload, FileVideo, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatBytes } from "../upload-utils";
import { useFileDropzone } from "./use-file-dropzone";

export type UploadDropzoneProps = {
  file: File | null;
  error?: string | null;
  disabled?: boolean;
  onFileSelect: (file: File | null) => void;
};

export default function UploadDropzone({
  file,
  error,
  disabled,
  onFileSelect,
}: UploadDropzoneProps) {
  const {
    inputRef,
    isDragActive,
    handleBrowse,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleInputChange,
  } = useFileDropzone({
    disabled,
    onFileSelect,
  });

  const dropzoneClassName = cn(
    "rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors duration-200",
    disabled && "cursor-not-allowed opacity-60",
    error
      ? "border-destructive/70 bg-destructive/5"
      : isDragActive
        ? "border-primary bg-primary/5"
        : "border-border/70 hover:border-primary/50",
  );

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={handleBrowse}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleBrowse();
          }
        }}
        onDragEnter={handleDragEnter}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={dropzoneClassName}
        aria-disabled={disabled}
        aria-label="Video upload dropzone"
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="sr-only"
          disabled={disabled}
          onChange={handleInputChange}
        />

        {file ? (
          <div className="mx-auto flex max-w-2xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-left">
              <FileVideo className="size-5 text-primary" />
              <div className="min-w-0">
                <p className="break-all text-sm font-semibold text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.size)} - {file.type || "video"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  handleBrowse();
                }}
                disabled={disabled}
              >
                Change
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={(event) => {
                  event.stopPropagation();
                  onFileSelect(null);
                }}
                disabled={disabled}
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="size-3.5" />
                  Remove
                </span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-lg flex-col items-center gap-3 text-center">
            <CloudUpload className="size-7 text-primary" />
            <div className="space-y-1.5">
              <p className="text-base font-semibold text-foreground">
                Drag and drop your video here
              </p>
              <p className="text-sm text-muted-foreground">
                Or click to choose a file from your computer
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              className="mt-1"
              onClick={(event) => {
                event.stopPropagation();
                handleBrowse();
              }}
              disabled={disabled}
            >
              Choose a file
            </Button>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
