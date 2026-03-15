"use client";

import { Controller, type Control, useWatch } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";
import { cn } from "@/lib/utils";
import { type VideoLicense, type UploadFormValues } from "../upload-schema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ExternalLink } from "lucide-react";
import { Label } from "@/components/ui/label";

const VIDEO_LICENSES: VideoLicense[] = [
  "all_rights_reserved",
  "cc_by",
  "cc_by_sa",
  "cc_by_nd",
  "cc_by_nc",
  "cc_by_nc_sa",
  "cc_by_nc_nd",
  "cc0",
];

const FULL_LICENSE_LABELS: Record<VideoLicense, string> = {
  all_rights_reserved: "All Rights Reserved (full copyright)",
  cc_by: "Creative Commons Attribution 4.0 (CC BY 4.0)",
  cc_by_sa: "Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0)",
  cc_by_nd: "Creative Commons Attribution-NoDerivatives 4.0 (CC BY-ND 4.0)",
  cc_by_nc: "Creative Commons Attribution-NonCommercial 4.0 (CC BY-NC 4.0)",
  cc_by_nc_sa: "Creative Commons Attribution-NonCommercial-ShareAlike 4.0 (CC BY-NC-SA 4.0)",
  cc_by_nc_nd: "Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 (CC BY-NC-ND 4.0)",
  cc0: "Creative Commons CC0 1.0 Public Domain Dedication",
};

function getLicenseUrl(license: VideoLicense | undefined): string | null {
  if (!license) return null;
  if (license === "all_rights_reserved") {
    return "https://en.wikipedia.org/wiki/All_rights_reserved";
  }
  if (license === "cc0") return "https://creativecommons.org/publicdomain/zero/1.0/";
  return `https://creativecommons.org/licenses/${license.replace("cc_", "").replace(/_/g, "-")}/4.0/`;
}

type LicensePickerProps = {
  control: Control<UploadFormValues>;
  errors: FieldErrors<UploadFormValues>;
  disabled?: boolean;
};

export default function LicensePicker({ control, errors, disabled }: LicensePickerProps) {
  const selectedLicense = useWatch({ control, name: "license" });

  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-muted-foreground">License</Label>

      <Accordion
        type="single"
        collapsible
        className="rounded-xl border border-border overflow-hidden"
      >
        <AccordionItem value="license" className="border-none">
          <AccordionTrigger className="px-3.5 py-2.5 hover:no-underline hover:bg-muted/40 [&[data-state=open]]:bg-muted/40 transition-colors">
            <span className="text-sm font-medium text-foreground">
              {selectedLicense ? FULL_LICENSE_LABELS[selectedLicense] : "Select a license"}
            </span>
          </AccordionTrigger>

          <AccordionContent className="pb-0">
            <Controller
              control={control}
              name="license"
              render={({ field }) => (
                <div className="divide-y divide-border border-t border-border">
                  {VIDEO_LICENSES.map((license) => {
                    const selected = field.value === license;
                    const learnMoreUrl = getLicenseUrl(license);

                    return (
                      <div
                        key={license}
                        role="radio"
                        aria-checked={selected}
                        tabIndex={disabled ? -1 : 0}
                        onClick={() => {
                          if (!disabled) field.onChange(license);
                        }}
                        onKeyDown={(event) => {
                          if (disabled) return;
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            field.onChange(license);
                          }
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors",
                          selected ? "bg-primary/5" : "bg-background hover:bg-muted/40",
                          disabled && "cursor-not-allowed opacity-50",
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                              selected ? "border-primary bg-primary" : "border-muted-foreground/40",
                            )}
                          >
                            {selected && (
                              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                            )}
                          </span>
                          <span
                            className={cn(
                              "text-sm",
                              selected ? "font-medium text-foreground" : "text-muted-foreground",
                            )}
                          >
                            {FULL_LICENSE_LABELS[license]}
                          </span>
                        </div>

                        {learnMoreUrl && (
                          <a
                            href={learnMoreUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                          >
                            Learn more
                            <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {errors.license?.message && (
        <p className="text-sm text-destructive">{errors.license.message}</p>
      )}
    </div>
  );
}
