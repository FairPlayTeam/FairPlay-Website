"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";

export type UseFileDropzoneOptions = {
  disabled?: boolean;
  onFileSelect: (file: File | null) => void;
};

export function useFileDropzone({
  disabled,
  onFileSelect,
}: UseFileDropzoneOptions) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const dragCounter = useRef(0);

  const handleFiles = (files: FileList | null) => {
    const nextFile = files?.[0] ?? null;
    onFileSelect(nextFile);
  };

  const handleBrowse = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    dragCounter.current += 1;
    setIsDragActive(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      setIsDragActive(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    dragCounter.current = 0;
    setIsDragActive(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
    event.target.value = "";
  };

  return {
    inputRef,
    isDragActive,
    handleBrowse,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleInputChange,
  };
}
