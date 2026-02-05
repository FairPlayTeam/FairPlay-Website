export const normalizeTags = (value: string) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

export const formatBytes = (value: number) => {
  if (value === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(value) / Math.log(k));
  const size = value / Math.pow(k, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
};

export const clampPercentage = (value: number) =>
  Math.max(0, Math.min(100, value));
