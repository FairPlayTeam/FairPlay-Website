"use client";

import { useCallback, useState } from "react";
import { uploadImage } from "@/lib/uploads/images";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const MAX_BANNER_SIZE = 5 * 1024 * 1024;

function validate(file: File, maxSize: number) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Unsupported format. Please use PNG, JPEG, or WEBP.");
  }
  if (file.size > maxSize) {
    throw new Error(`File too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB.`);
  }
}

export function useImagesUpload() {
  const [uploadCount, setUploadCount] = useState(0);

  const upload = useCallback(async (file: File, type: "avatar" | "banner", maxSize: number) => {
    validate(file, maxSize);

    setUploadCount((c) => c + 1);
    try {
      return await uploadImage(file, type);
    } finally {
      setUploadCount((c) => Math.max(0, c - 1));
    }
  }, []);

  const uploadUserAvatar = useCallback(
    (file: File) => upload(file, "avatar", MAX_AVATAR_SIZE),
    [upload],
  );
  const uploadUserBanner = useCallback(
    (file: File) => upload(file, "banner", MAX_BANNER_SIZE),
    [upload],
  );

  return {
    uploadUserAvatar,
    uploadUserBanner,
    isUploading: uploadCount > 0,
  };
}
