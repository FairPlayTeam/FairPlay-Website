"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { FaFileVideo } from "react-icons/fa";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import type { UploadFormValues } from "../upload-schema";
import { formatBytes } from "../upload-utils";

export type UploadDetailsFormFieldsProps = {
  file: File | null;
  disabled?: boolean;
  register: UseFormRegister<UploadFormValues>;
  errors: FieldErrors<UploadFormValues>;
  onChangeFile: () => void;
};

export default function UploadDetailsFormFields({
  file,
  disabled,
  register,
  errors,
  onChangeFile,
}: UploadDetailsFormFieldsProps) {
  return (
    <>
      {file && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-border/60 bg-container-dark/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid min-w-10 min-h-10 place-items-center rounded-lg bg-accent/10 text-accent">
              <FaFileVideo className="size-4.5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-text break-all">{file.name}</p>
              <p className="text-xs text-text-amount">
                {formatBytes(file.size)} - {file.type || "video"}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="border border-border/60"
            onClick={onChangeFile}
          >
            Change file
          </Button>
        </div>
      )}

      <div className="grid gap-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm text-text-amount">
            Title
          </label>
          <Input
            id="title"
            placeholder="Video title"
            {...register("title")}
            aria-invalid={!!errors.title}
            disabled={disabled}
          />
          {errors.title?.message && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm text-text-amount">
            Description
          </label>
          <Textarea
            id="description"
            placeholder="Tell viewers what to expect"
            {...register("description")}
            aria-invalid={!!errors.description}
            disabled={disabled}
          />
          {errors.description?.message && (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
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
            disabled={disabled}
          />
          {errors.tags?.message && (
            <p className="text-red-500 text-sm">{errors.tags.message}</p>
          )}
        </div>
      </div>
    </>
  );
}
