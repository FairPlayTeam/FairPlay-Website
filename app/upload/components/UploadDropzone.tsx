"use client";

import { FaCloudUploadAlt, FaFileVideo, FaTrash } from "react-icons/fa";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { formatBytes } from "../upload-utils";
import { useFileDropzone } from "./useFileDropzone";

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
        className={cn(
          "group relative rounded-2xl border border-dashed p-8 transition-all duration-200",
          "bg-container-dark/40",
          disabled && "cursor-not-allowed opacity-60",
          error
            ? "border-red-500/70 bg-red-500/5"
            : isDragActive
              ? "border-accent bg-accent/5"
              : "border-border/80 hover:border-accent/80 hover:bg-container-dark/60"
        )}
        aria-disabled={disabled}
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-accent/10 text-accent">
                <FaFileVideo className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-text break-all">{file.name}</p>
                <p className="text-xs text-text-amount">
                  {formatBytes(file.size)} - {file.type || "video"}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-red-400 border border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
              onClick={(event) => {
                event.stopPropagation();
                onFileSelect(null);
              }}
              disabled={disabled}
            >
              <span className="flex items-center gap-2">
                <FaTrash className="size-3.5" />
                Remove
              </span>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-accent/10 text-accent">
              <FaCloudUploadAlt className="size-6" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-text">
                Drag and drop your video here
              </p>
              <p className="text-xs text-text-amount">
                Or browse from your computer
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
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

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
