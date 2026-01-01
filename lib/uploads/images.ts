import { api } from "@/lib/api";

export const uploadFile = async (file: File, type: "avatar" | "banner") => {
  const formData = new FormData();
  formData.append(type, file);

  const res = await api.post(`/upload/${type}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};
