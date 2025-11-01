"use client";

type Props = {
  visibility?: string;
  processingStatus?: string;
  moderationStatus?: string;
};

export default function StatusBadges({
  visibility,
  processingStatus,
  moderationStatus,
}: Props) {
  const items = [visibility, processingStatus, moderationStatus].filter(Boolean) as string[];
  if (!items.length) return null;

  return (
    <div className="flex flex-row flex-wrap gap-2 mt-2">
      {items.map((v) => (
        <span
          key={v}
          className="border rounded-full px-2 py-1 text-sm border-gray-400 text-gray-800 dark:border-gray-600 dark:text-gray-200"
        >
          {v}
        </span>
      ))}
    </div>
  );
}