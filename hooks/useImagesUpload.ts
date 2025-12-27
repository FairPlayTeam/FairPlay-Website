import { useState } from "react";
import { uploadFile } from "@/lib/uploads/images";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const MAX_BANNER_SIZE = 5 * 1024 * 1024;

function validate(file: File, maxSize: number) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Unsupported format");
  }
  if (file.size > maxSize) {
    throw new Error("File too large");
  }
}

export function useImagesUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadUserAvatar = async (file: File) => {
    validate(file, MAX_AVATAR_SIZE);
    setIsUploading(true);
    try {
      return await uploadFile(file, "avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const uploadUserBanner = async (file: File) => {
    validate(file, MAX_BANNER_SIZE);
    setIsUploading(true);
    try {
      return await uploadFile(file, "banner");
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadUserAvatar,
    uploadUserBanner,
    isUploading,
  };
}