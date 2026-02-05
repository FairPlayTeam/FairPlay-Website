"use client";

import type { ReactNode } from "react";
import { clampPercentage } from "../upload-utils";

export type UploadStepScreenProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  stepProgress?: number;
};

export default function UploadStepScreen({
  title,
  subtitle,
  children,
  actions,
  stepProgress = 0,
}: UploadStepScreenProps) {
  const clampedProgress = clampPercentage(
    Number.isFinite(stepProgress) ? stepProgress : 0
  );

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-container/80 p-6 md:p-8">
      <div className="absolute inset-x-0 top-0 h-1">
        <div
          className="h-full bg-accent transition-[width] duration-500 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      <header className="space-y-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        {subtitle && <p className="text-sm text-text-amount">{subtitle}</p>}
      </header>
      <div className="mt-6">{children}</div>
      {actions && (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {actions}
        </div>
      )}
    </section>
  );
}
