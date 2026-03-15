import * as z from "zod";
import { normalizeTags } from "./upload-utils";

const VIDEO_LICENSES = [
  "all_rights_reserved",
  "cc_by",
  "cc_by_sa",
  "cc_by_nd",
  "cc_by_nc",
  "cc_by_nc_sa",
  "cc_by_nc_nd",
  "cc0",
] as const;

export type VideoLicense = (typeof VIDEO_LICENSES)[number];

export const LICENSE_LABELS: Record<VideoLicense, string> = {
  all_rights_reserved: "All Rights Reserved",
  cc_by: "CC BY",
  cc_by_sa: "CC BY-SA",
  cc_by_nd: "CC BY-ND",
  cc_by_nc: "CC BY-NC",
  cc_by_nc_sa: "CC BY-NC-SA",
  cc_by_nc_nd: "CC BY-NC-ND",
  cc0: "CC0 (Public Domain)",
};

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
  allowComments: z.boolean().default(true),
  license: z.enum(VIDEO_LICENSES).default("all_rights_reserved"),
});

export type UploadFormValues = z.input<typeof uploadSchema>;
