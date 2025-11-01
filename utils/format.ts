export function formatViews(v?: string | number) {
  if (v == null) return '';
  const n = typeof v === 'string' ? Number(v) : v;
  if (!isFinite(n)) return '';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k views`;
  return `${n} views`;
}

export function formatRating(avg?: number, count?: number) {
  if (typeof avg !== 'number') return '';
  if (typeof count === 'number') return `${avg.toFixed(1)}★ (${count})`;
  return `${avg.toFixed(1)}★`;
}

export function formatDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString();
}

export function composeMeta(parts: (string | undefined)[]) {
  const clean = parts.filter((p) => !!p && p.trim().length > 0) as string[];
  return clean.join(' • ');
}