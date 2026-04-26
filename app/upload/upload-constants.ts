export type UploadState = "idle" | "uploading" | "done" | "error";
export type UploadStep = 1 | 2 | 3 | 4;

const MEBIBYTE = 1024 * 1024;

export const MAX_VIDEO_UPLOAD_TOTAL_BYTES = 3040 * MEBIBYTE;
export const MAX_VIDEO_UPLOAD_TOTAL_MB = Math.round(MAX_VIDEO_UPLOAD_TOTAL_BYTES / MEBIBYTE);
export const MAX_THUMBNAIL_BYTES = 5 * MEBIBYTE;
export const MAX_THUMBNAIL_MB = Math.round(MAX_THUMBNAIL_BYTES / MEBIBYTE);
export const DEFAULT_UPLOADING_LABEL = "Uploading video";

export const UPLOAD_STEPS = [
  { id: 1, title: "File" },
  { id: 2, title: "Details" },
  { id: 3, title: "Thumbnail" },
  { id: 4, title: "Upload" },
] as const;
