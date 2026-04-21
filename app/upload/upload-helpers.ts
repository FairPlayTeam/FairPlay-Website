import type { UploadState } from "./upload-constants";
import { DEFAULT_UPLOADING_LABEL } from "./upload-constants";
import { getApiErrorMessage } from "../../lib/api-error";

export type UploadRequestState = {
  state: UploadState;
  progress: number;
  error: string | null;
  uploadingLabel: string;
};

export const createIdleUploadRequestState = (): UploadRequestState => ({
  state: "idle",
  progress: 0,
  error: null,
  uploadingLabel: DEFAULT_UPLOADING_LABEL,
});

export const resolveUploadErrorMessage = (error: unknown, fallback = "Something went wrong!") => {
  const responseData = (
    error as {
      code?: string;
      name?: string;
    }
  );

  if (responseData?.code === "ERR_CANCELED" || responseData?.name === "CanceledError") {
    return "Upload canceled.";
  }

  return getApiErrorMessage(error, fallback);
};

export const getCombinedUploadState = ({ video }: { video: UploadRequestState }) => {
  const state: UploadState = video.state;
  const progress = video.progress;
  const error = video.error;

  const labels = {
    idle: "Ready to upload",
    uploading: video.uploadingLabel || DEFAULT_UPLOADING_LABEL,
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
