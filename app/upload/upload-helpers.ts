import type { UploadState } from "./upload-constants";

export type UploadRequestState = {
  state: UploadState;
  progress: number;
  error: string | null;
};

export const createIdleUploadRequestState = (): UploadRequestState => ({
  state: "idle",
  progress: 0,
  error: null,
});

export const resolveUploadErrorMessage = (
  error: unknown,
  fallback = "Something went wrong!"
) => {
  const responseData = (
    error as {
      response?: { data?: { error?: string; message?: string } };
    }
  )?.response?.data;
  const message = responseData?.error ?? responseData?.message;

  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
};

export const getCombinedUploadState = ({ video }: {
  video: UploadRequestState;
}) => {
  const state: UploadState = video.state;
  const progress = video.progress;
  const error = video.error;

  const labels = {
    idle: "Ready to upload",
    uploading: "Uploading video",
    done: "Upload complete",
    error: "Upload failed",
  };

  return {
    state,
    progress,
    error,
    labels,
  };
};
