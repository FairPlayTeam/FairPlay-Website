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
import { toast } from "@/components/ui/Toast/toast-utils";

const normalizeTags = (value: string) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

const uploadSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title cannot be longer than 100 characters."),
  description: z
    .string()
    .max(1000, "Description cannot be longer than 1000 characters.")
    .optional(),
  tags: z
    .string()
    .max(100, "Tags cannot be longer than 100 characters.")
    .refine((value) => {
      if (!value || value.trim().length === 0) {
        return true;
      }

      const tags = normalizeTags(value);

      if (tags.length === 0) {
        return false;
      }

      return tags.every((tag) => !/\s/.test(tag));
    }, "Each tag must be a single word (no spaces), separated by commas.")
    .refine((value) => {
      if (!value || value.trim().length === 0) {
        return true;
      }

      const tags = normalizeTags(value);
      const normalized = tags.map((tag) => tag.toLowerCase());

      return new Set(normalized).size === normalized.length;
    }, "Duplicate tags are not allowed.")
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
      const normalizedTags = normalizeTags(data.tags).join(",");

      if (normalizedTags.length > 0) {
        formData.append("tags", normalizedTags);
      }
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
      toast.success(
        "Video uploaded successfully! Your video is going to be reviewed by us before being public."
      );

      router.push(`/profile?tab=videos`);
    } catch (error) {
      toast.error("Upload failed.");
      setUploadError(
        (error as { response: { data: { error: string } } })?.response.data
          .error ?? "Something went wrong!"
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container px-5 py-10 md:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Upload Video</h1>
          <p className="text-text-amount mt-2">
            Share your latest work with the community.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-6">
            <div className="rounded-2xl border border-border bg-container/80 p-6 md:p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="title" className="text-sm text-text-amount">
                      Title
                    </label>
                    <Input
                      id="title"
                      placeholder="Video title"
                      {...register("title")}
                      aria-invalid={!!errors.title}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm">
                        {errors.title.message as string}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label
                      htmlFor="description"
                      className="text-sm text-text-amount"
                    >
                      Description
                    </label>
                    <Textarea
                      id="description"
                      placeholder="Video description"
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
                    <label htmlFor="tags" className="text-sm text-text-amount">
                      Tags (comma separated)
                    </label>
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
                    <label htmlFor="video" className="text-sm text-text-amount">
                      Video file
                    </label>
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
                </div>

                {uploadError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                    {uploadError}
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="submit"
                    variant="donateSecondary"
                    disabled={isUploading}
                    className="w-full rounded-lg sm:min-w-50"
                  >
                    {isUploading ? "Uploading..." : "Upload Video"}
                  </Button>
                </div>
              </form>
            </div>
            <div className="rounded-2xl border border-border bg-container/80 p-6 md:p-6">
              <p className="text-sm text-text text-center">
                Videos are reviewed before they become public!
              </p>
            </div>
          </div>

          <aside className="rounded-2xl border border-border bg-container/80 p-6 md:p-6">
            <div className="flex items-start gap-4">
              <h2 className="text-xl font-semibold">Guidelines</h2>
            </div>

            <div className="mt-6 space-y-4 text-sm text-text-amount">
              <div className="rounded-lg border border-border/60 bg-container-dark/60 p-4">
                <p className="font-semibold text-green-400">Allowed content</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  <li>Documentaries, tutorials, educational videos</li>
                  <li>Personal projects, podcasts, art, culture</li>
                  <li>Lifestyle, development, music, creative content</li>
                  <li>
                    Fictional violence (movies, games) when contextualized and
                    not glorified
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-border/60 bg-container-dark/60 p-4">
                <p className="font-semibold text-red-400">Not allowed</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  <li>Real or excessively graphic violent content</li>
                  <li>Political or religious propaganda</li>
                  <li>NSFW content</li>
                  <li>Automatically generated AI videos</li>
                  <li>
                    Misleading or false information (relative to the scientific
                    consensus; fake news, conspiracies, etc.)
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
