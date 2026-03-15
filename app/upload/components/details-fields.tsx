"use client";

import { FileVideo } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { UploadFormValues } from "../upload-schema";
import { formatBytes } from "../upload-utils";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import LicensePicker from "./license-picker";

export type UploadDetailsFormFieldsProps = {
  file: File | null;
  disabled?: boolean;
  register: UseFormRegister<UploadFormValues>;
  control: Control<UploadFormValues>;
  errors: FieldErrors<UploadFormValues>;
  onChangeFile: () => void;
};

export default function UploadDetailsFormFields({
  file,
  disabled,
  register,
  control,
  errors,
  onChangeFile,
}: UploadDetailsFormFieldsProps) {
  return (
    <>
      {file && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-muted/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid min-w-10 min-h-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <FileVideo className="size-4.5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground break-all">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(file.size)} - {file.type || "video"}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="border border-border"
            onClick={onChangeFile}
          >
            Change file
          </Button>
        </div>
      )}

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm text-muted-foreground">
            Title
          </Label>
          <Input
            id="title"
            placeholder="Video title"
            {...register("title")}
            aria-invalid={!!errors.title}
            disabled={disabled}
          />
          {errors.title?.message && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm text-muted-foreground">
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Tell viewers what to expect"
            {...register("description")}
            aria-invalid={!!errors.description}
            disabled={disabled}
          />
          {errors.description?.message && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags" className="text-sm text-muted-foreground">
            Tags (comma separated)
          </Label>
          <Input
            id="tags"
            placeholder="gaming, programming, science"
            {...register("tags")}
            aria-invalid={!!errors.tags}
            disabled={disabled}
          />
          {errors.tags?.message && (
            <p className="text-sm text-destructive">{errors.tags.message}</p>
          )}
        </div>
        <FieldLabel htmlFor="allow-comments-switch">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Allow comments</FieldTitle>
              <FieldDescription>Let viewers comment on this video</FieldDescription>
            </FieldContent>
            <Controller
              control={control}
              name="allowComments"
              render={({ field }) => (
                <Switch
                  id="allow-comments-switch"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              )}
            />
          </Field>
        </FieldLabel>
        <LicensePicker control={control} errors={errors} disabled={disabled} />
      </div>
    </>
  );
}
