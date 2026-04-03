import { cn } from "@/lib/utils";

interface SectionIntroProps {
  title: string;
  accent?: string;
  accentPosition?: "start" | "end";
  description?: string;
  align?: "left" | "center";
  className?: string;
  descriptionClassName?: string;
}

export default function SectionIntro({
  title,
  accent,
  accentPosition = "end",
  description,
  align = "center",
  className,
  descriptionClassName,
}: SectionIntroProps) {
  const isCentered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        isCentered ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      <div className={cn("h-px w-16 bg-primary/30", !isCentered && "ml-0")} />

      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
          {accent && accentPosition === "start" ? (
            <>
              <span className="italic text-primary">{accent}</span> {title}
            </>
          ) : (
            <>
              {title} {accent ? <span className="italic text-primary">{accent}</span> : null}
            </>
          )}
        </h2>

        {description ? (
          <p
            className={cn(
              "max-w-2xl text-base leading-8 text-muted-foreground md:text-lg",
              descriptionClassName,
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
