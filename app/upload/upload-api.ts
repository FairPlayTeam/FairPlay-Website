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

type ProgressHandler = (progress: number) => void;

const toPercentage = (event: AxiosProgressEvent) => {
  const progressValue =
    event.progress ?? (event.total ? event.loaded / event.total : 0);

  return clampPercentage(Math.round(progressValue * 100));
};

export const uploadVideo = async ({
  file,
  thumbnail,
  values,
  onProgress,
}: {
  file: File;
  thumbnail?: File | null;
  values: UploadFormValues;
  onProgress?: ProgressHandler;
}) => {
  const formData = new FormData();

  formData.append("title", values.title.trim());
  formData.append("video", file);
  if (thumbnail) {
    formData.append("thumbnail", thumbnail);
  }

  if (values.description) {
    const description = values.description.trim();
    if (description.length > 0) {
      formData.append("description", description);
    }
  }

  if (values.tags) {
    const normalizedTags = normalizeTags(values.tags).join(",");
    if (normalizedTags.length > 0) {
      formData.append("tags", normalizedTags);
    }
  }

  const response = await api.post<UploadVideoResponse>(
    "/upload/video-bundle",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (event) => {
        onProgress?.(toPercentage(event));
      },
    }
  );

  return response.data.video;
};
