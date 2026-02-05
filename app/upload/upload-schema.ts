import * as z from "zod";
import { normalizeTags } from "./upload-utils";

export const uploadSchema = z.object({
  title: z
    .string()
    .max(100, "Title cannot be longer than 100 characters.")
    .refine((value) => value.trim().length > 0, "Title is required"),
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
        return true;
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
});

export type UploadFormValues = z.infer<typeof uploadSchema>;
