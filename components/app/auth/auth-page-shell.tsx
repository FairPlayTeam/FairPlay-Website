import Link from "next/link";
import type { FormEventHandler, ReactNode } from "react";
import { Button } from "@/components/ui/button";

type AuthPageShellProps = {
  title: string;
  switchHref: string;
  switchLabel: string;
  formId: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  submitLabel: string;
  submitPendingLabel: string;
  isSubmitting: boolean;
  error: string | null;
  errorId: string;
  children: ReactNode;
  footerContent?: ReactNode;
};

export function AuthPageShell({
  title,
  switchHref,
  switchLabel,
  formId,
  onSubmit,
  submitLabel,
  submitPendingLabel,
  isSubmitting,
  error,
  errorId,
  children,
  footerContent,
}: AuthPageShellProps) {
  const titleId = `${formId}-title`;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <main className="flex w-full flex-col items-center justify-center px-8 py-12 md:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h1 id={titleId} className="text-2xl font-semibold text-foreground">
              {title}
            </h1>
            <Button
              asChild
              variant="link"
              className="h-auto p-0 text-muted-foreground hover:text-primary"
            >
              <Link href={switchHref}>{switchLabel}</Link>
            </Button>
          </div>

          <form
            id={formId}
            noValidate
            onSubmit={onSubmit}
            aria-busy={isSubmitting}
            aria-labelledby={titleId}
            aria-describedby={error ? errorId : undefined}
          >
            <div className="flex flex-col gap-5">{children}</div>
          </form>

          <div className="mt-6 flex flex-col gap-3">
            {footerContent}
            {error ? (
              <p
                id={errorId}
                role="alert"
                aria-live="assertive"
                className="text-sm text-destructive"
              >
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              form={formId}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              aria-describedby={error ? errorId : undefined}
            >
              {isSubmitting ? submitPendingLabel : submitLabel}
            </Button>
          </div>
        </div>
      </main>

      <aside className="hidden border-l bg-white md:block md:w-1/2">
        {/* TODO: Add auth illustration/content */}
      </aside>
    </div>
  );
}
