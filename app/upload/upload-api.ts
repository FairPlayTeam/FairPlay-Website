import type { AxiosProgressEvent } from "axios";
import { api } from "@/lib/api";
import type { UploadFormValues } from "./upload-schema";
import { clampPercentage, normalizeTags } from "./upload-utils";

type UploadVideoResponse = {
  message: string;
  video: {
    id: string;
    title: string;
    thumbnailUrl?: string | null;
  };
};

type ChunkedUploadInitResponse = {
  uploadId: string;
  chunkSizeBytes: number;
  chunkSizeMB: number;
  totalChunks: number;
  totalSize: number;
};

type UploadProgressSnapshot = {
  progress: number;
  label: string;
};

type ProgressHandler = (snapshot: UploadProgressSnapshot) => void;

const INIT_UPLOAD_TIMEOUT_MS = 30 * 1000;
const CHUNK_UPLOAD_TIMEOUT_MS = 15 * 60 * 1000;
const COMPLETE_UPLOAD_TIMEOUT_MS = 20 * 60 * 1000;

const PREPARING_PROGRESS = 2;
const CHUNK_PROGRESS_START = 5;
const CHUNK_PROGRESS_END = 95;
const FINALIZING_PROGRESS = 98;

const emitProgress = (
  onProgress: ProgressHandler | undefined,
  progress: number,
  label: string,
) => {
  onProgress?.({
    progress: clampPercentage(Math.round(progress)),
    label,
  });
};

const buildInitPayload = (file: File, values: UploadFormValues) => {
  const payload: Record<string, string | number | boolean> = {
    title: values.title.trim(),
    allowComments: values.allowComments ?? true,
    license: values.license ?? "all_rights_reserved",
    totalSize: file.size,
    originalName: file.name,
  };

  if (file.type) {
    payload.mimeType = file.type;
  }

  if (values.description) {
    const description = values.description.trim();
    if (description.length > 0) {
      payload.description = description;
    }
  }

  if (values.tags) {
    const normalizedTags = normalizeTags(values.tags).join(",");
    if (normalizedTags.length > 0) {
      payload.tags = normalizedTags;
    }
  }

  return payload;
};

const getChunkUploadLabel = (chunkIndex: number, totalChunks: number) =>
  totalChunks > 1 ? `Uploading chunk ${chunkIndex + 1} of ${totalChunks}` : "Uploading video";

const mapChunkProgress = (uploadedBytes: number, totalBytes: number) => {
  const safeTotalBytes = Math.max(totalBytes, 1);
  const ratio = Math.max(0, Math.min(1, uploadedBytes / safeTotalBytes));
  return CHUNK_PROGRESS_START + ratio * (CHUNK_PROGRESS_END - CHUNK_PROGRESS_START);
};

const createChunkFormData = (chunk: Blob, chunkIndex: number, fileName: string) => {
  const formData = new FormData();
  formData.append("chunkIndex", String(chunkIndex));
  formData.append("chunk", chunk, `${fileName}.part-${chunkIndex}`);
  return formData;
};

const createCompletionFormData = (thumbnail?: File | null) => {
  const formData = new FormData();
  if (thumbnail) {
    formData.append("thumbnail", thumbnail);
  }
  return formData;
};

const abortChunkedUpload = async (uploadId: string) => {
  try {
    await api.delete(`/upload/video-chunks/${encodeURIComponent(uploadId)}`, {
      timeout: INIT_UPLOAD_TIMEOUT_MS,
    });
  } catch {
    // Best-effort cleanup only.
  }
};

const toLoadedBytes = (event: AxiosProgressEvent, chunkSize: number) => {
  const loadedBytes = event.loaded ?? 0;
  return Math.max(0, Math.min(chunkSize, loadedBytes));
};

export const uploadVideo = async ({
  file,
  thumbnail,
  values,
  onProgress,
  signal,
}: {
  file: File;
  thumbnail?: File | null;
  values: UploadFormValues;
  onProgress?: ProgressHandler;
  signal?: AbortSignal;
}) => {
  let uploadId: string | null = null;

  try {
    emitProgress(onProgress, PREPARING_PROGRESS, "Preparing upload");

    const initResponse = await api.post<ChunkedUploadInitResponse>(
      "/upload/video-chunks/init",
      buildInitPayload(file, values),
      {
        signal,
        timeout: INIT_UPLOAD_TIMEOUT_MS,
      },
    );

    uploadId = initResponse.data.uploadId;
    const { chunkSizeBytes, totalChunks } = initResponse.data;

    let uploadedBytes = 0;

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex += 1) {
      const start = chunkIndex * chunkSizeBytes;
      const end = Math.min(start + chunkSizeBytes, file.size);
      const chunk = file.slice(start, end);
      const label = getChunkUploadLabel(chunkIndex, totalChunks);

      await api.post(
        `/upload/video-chunks/${encodeURIComponent(uploadId)}/chunk`,
        createChunkFormData(chunk, chunkIndex, file.name),
        {
          signal,
          timeout: CHUNK_UPLOAD_TIMEOUT_MS,
          onUploadProgress: (event) => {
            const currentChunkBytes = toLoadedBytes(event, chunk.size);
            emitProgress(
              onProgress,
              mapChunkProgress(uploadedBytes + currentChunkBytes, file.size),
              label,
            );
          },
        },
      );

      uploadedBytes += chunk.size;
      emitProgress(onProgress, mapChunkProgress(uploadedBytes, file.size), label);
    }

    emitProgress(
      onProgress,
      FINALIZING_PROGRESS,
      thumbnail ? "Uploading thumbnail and finalizing" : "Finalizing upload",
    );

    const response = await api.post<UploadVideoResponse>(
      `/upload/video-chunks/${encodeURIComponent(uploadId)}/complete`,
      createCompletionFormData(thumbnail),
      {
        signal,
        timeout: COMPLETE_UPLOAD_TIMEOUT_MS,
      },
    );

    return response.data.video;
  } catch (error) {
    if (uploadId) {
      await abortChunkedUpload(uploadId);
    }

    throw error;
  }
};
