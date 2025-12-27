"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import Toast from "@/components/ui/Toast/Toast"

const uploadSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title cannot be longer than 100 characters."),
  description: z
    .string()
    .max(500, "Description cannot be longer than 500 characters.")
    .optional(),
  tags: z
    .string()
    .max(100, "Tags cannot be longer than 100 characters.")
    .optional(),
  video: z
    .any()
    .refine((files) => files?.length === 1, "Video file is required")
    .refine(
      (files) => files?.[0]?.type?.startsWith("video/"),
      "File must be a video"
    ),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

export default function UploadPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "warning" | "info" } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/login?callbackUrl=/upload`);
    }
  }, [user, isLoading, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
  });

  const onSubmit = async (data: UploadFormValues) => {
    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();

    formData.append("title", data.title.trim());
    formData.append("video", data.video[0]);

    if (data.description) {
      formData.append("description", data.description.trim());
    }

    if (data.tags) {
      formData.append("tags", data.tags.trim());
    }

    try {
      await api.post<{
        message: string;
        video: { id: string; title: string };
      }>("/upload/video", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }); 
      setToast({ message: "Video uploaded successfully!", type: "success" });

    } catch (error) {
      console.error("Upload failed:", error);
      setToast({ message: "Upload failed.", type: "error" });
      setUploadError(
        (error as { response: { data: { error: string } } })?.response.data
          .error ?? "Something went wrong!"
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-5">
      <h1 className="text-3xl text-center mb-6">Upload Video</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title">Title</label>
          <Input
            id="title"
            placeholder="Video Title"
            {...register("title")}
            aria-invalid={!!errors.title}
          />
          {errors.title && (
            <p className="text-red-500 text-sm">
              {errors.title.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="description">Description</label>
          <Textarea
            id="description"
            placeholder="Video Description"
            {...register("description")}
            aria-invalid={!!errors.description}
          />
          {errors.description && (
            <p className="text-red-500 text-sm">
              {errors.description.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="tags">Tags (comma separated)</label>
          <Input
            id="tags"
            placeholder="gaming, programming, science"
            {...register("tags")}
            aria-invalid={!!errors.tags}
          />
          {errors.tags && (
            <p className="text-red-500 text-sm">
              {errors.tags.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="video">Video File</label>
          <Input
            id="video"
            type="file"
            accept="video/*"
            {...register("video")}
            aria-invalid={!!errors.video}
          />
          {errors.video && (
            <p className="text-red-500 text-sm">
              {errors.video.message as string}
            </p>
          )}
        </div>

        {uploadError && (
          <div className="p-4 bg-red-500/10 border border-red-500 rounded text-red-500">
            {uploadError}
          </div>
        )}

        <Button type="submit" disabled={isUploading} className="w-full mt-4">
          {isUploading ? "Uploading..." : "Upload Video"}
        </Button>
      </form>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={3000}
        />
      )}
    </div>
  );
}
