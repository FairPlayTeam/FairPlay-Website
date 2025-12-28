import { cn } from "@/lib/utils";

type BadgeStatus = "private" | "unlisted" | "public" | "rejected" | "pending" | "approved";

interface StatusBadgesProps {
  visibility: "private" | "unlisted" | "public";
  moderationStatus: "rejected" | "pending" | "approved";
  // we're not dealing with the processing status
  // since a video needs to be verified anyway before being public.
}

function StatusBadge({
  label,
  status,
}: {
  label: string;
  status: BadgeStatus;
}) {
  return (
    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md font-medium text-text bg-background/80 backdrop-blur-md">
      <span
        className={cn(
          "size-2 rounded-full",
          status === "private" || status === "rejected"
            ? "bg-red-500"
            : status === "unlisted" || status === "pending"
            ? "bg-yellow-500"
            : "bg-green-500"
        )}
      />
      {label}
    </span>
  );
}

export function StatusBadges({ visibility, moderationStatus }: StatusBadgesProps) {
  return (
    <div className="absolute top-2 left-2 flex gap-1 text-xs">
      <StatusBadge label={visibility} status={visibility} />
      <StatusBadge label={moderationStatus} status={moderationStatus} />
    </div>
  );
}