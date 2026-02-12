"use client";

import { useEffect, useState } from "react";
import { FaImage, FaTrash } from "react-icons/fa";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { formatBytes } from "../upload-utils";
import { useFileDropzone } from "./useFileDropzone";

export type ThumbnailDropzoneProps = {
  file: File | null;
  error?: string | null;
  disabled?: boolean;
  onFileSelect: (file: File | null) => void;
};

export default function ThumbnailDropzone({
  file,
  error,
  disabled,
  onFileSelect,
}: ThumbnailDropzoneProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ratioHint, setRatioHint] = useState<string | null>(null);
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

  useEffect(() => {
    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    let isActive = true;

    const image = new Image();
    image.onload = () => {
      if (!isActive) return;
      setPreviewUrl(objectUrl);
      const targetRatio = 16 / 9;
      const currentRatio = image.width / image.height;
      const ratioDiff = Math.abs(currentRatio - targetRatio);

      if (ratioDiff > 0.03) {
        setRatioHint(
          `Current image ratio is ${image.width}:${image.height}. Recommended ratio is 16:9.`
        );
      }
    };

    image.onerror = () => {
      if (!isActive) return;
      setRatioHint("We recommend using a 16:9 thumbnail format.");
    };

    image.src = objectUrl;

    return () => {
      isActive = false;
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(null);
      setRatioHint(null);
    };
  }, [file]);

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
          accept="image/*"
          className="sr-only"
          disabled={disabled}
          onChange={handleInputChange}
        />

        {file ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid min-w-10 min-h-10 place-items-center rounded-xl bg-accent/10 text-accent">
                  <FaImage className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-text break-all">{file.name}</p>
                  <p className="text-xs text-text-amount">
                    {formatBytes(file.size)} - {file.type || "image"}
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

            {previewUrl && (
              <div className="space-y-2">
                <div className="overflow-hidden rounded-xl border border-border/60 bg-container-dark/70">
                  <img
                    src={previewUrl}
                    alt="Thumbnail preview"
                    className="aspect-video w-full object-cover"
                  />
                </div>
                {ratioHint && <p className="text-xs text-text-amount">{ratioHint}</p>}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-accent/10 text-accent">
              <FaImage className="size-6" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-text">
                Drag and drop your thumbnail here
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
              Choose an image
            </Button>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
