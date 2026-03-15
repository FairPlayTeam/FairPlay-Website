"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type AuthPasswordFieldProps = {
  id: string;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  registration: UseFormRegisterReturn;
  error?: string;
  descriptionId?: string;
  helper?: ReactNode;
  helperId?: string;
};

export function AuthPasswordField({
  id,
  label,
  placeholder,
  autoComplete,
  registration,
  error,
  descriptionId,
  helper,
  helperId,
}: AuthPasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const errorId = `${id}-error`;
  const resolvedHelperId = helper ? (helperId ?? `${id}-helper`) : undefined;
  const describedBy = [descriptionId, resolvedHelperId, error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-muted-foreground">
        {label}
      </Label>

      <div className="relative">
        <Input
          id={id}
          type={isVisible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
          className="border-input bg-card pr-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
          {...registration}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full text-muted-foreground"
          onClick={() => setIsVisible((prev) => !prev)}
          aria-label={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
        >
          {isVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
      </div>

      {helper ? (
        <div id={resolvedHelperId} aria-live="polite">
          {helper}
        </div>
      ) : null}

      {error ? (
        <p id={errorId} role="alert" aria-live="polite" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
