"use client";

import { useEffect, useState } from "react";
import NextImage from "next/image";
import { ImageIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatBytes } from "../upload-utils";
import { useFileDropzone } from "./use-file-dropzone";

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
    if (!file) return;

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
          `Current image ratio is ${image.width}:${image.height}. Recommended ratio is 16:9.`,
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
          "rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors duration-200",
          disabled && "cursor-not-allowed opacity-60",
          error
            ? "border-destructive/70 bg-destructive/5"
            : isDragActive
              ? "border-primary bg-primary/5"
              : "border-border/70 hover:border-primary/50",
        )}
        aria-disabled={disabled}
        aria-label="Thumbnail upload dropzone"
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
          <div className="mx-auto flex max-w-2xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-left">
              <ImageIcon className="size-5 text-primary" />
              <div className="min-w-0">
                <p className="break-all text-sm font-semibold text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.size)} - {file.type || "image"}
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
            <ImageIcon className="size-7 text-primary" />
            <div className="space-y-1.5">
              <p className="text-base font-semibold text-foreground">
                Drag and drop your thumbnail here
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
              Choose an image
            </Button>
          </div>
        )}

        {previewUrl && (
          <div className="mx-auto mt-6 max-w-2xl space-y-2 text-left">
            <div className="overflow-hidden rounded-xl border border-border bg-muted/70">
              <NextImage
                src={previewUrl}
                alt="Thumbnail preview"
                width={1280}
                height={720}
                unoptimized
                className="aspect-video w-full object-cover"
              />
            </div>
            {ratioHint && <p className="text-xs text-muted-foreground">{ratioHint}</p>}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
