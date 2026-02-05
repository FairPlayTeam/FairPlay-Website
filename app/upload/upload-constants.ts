export type UploadState = "idle" | "uploading" | "done" | "error";
export type UploadStep = 1 | 2 | 3 | 4;

export const UPLOAD_STEPS = [
  { id: 1, title: "File" },
  { id: 2, title: "Details" },
  { id: 3, title: "Thumbnail" },
  { id: 4, title: "Upload" },
] as const;
