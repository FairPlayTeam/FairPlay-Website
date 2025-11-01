export function getCols(width: number) {
  if (width >= 1440) return 5;
  if (width >= 1200) return 4;
  if (width >= 900) return 3;
  return 2;
}

export function computeItemWidth(width: number, paddingHorizontal: number, columnGap: number) {
  const cols = getCols(width);
  const available = Math.max(0, width - paddingHorizontal * 2 - columnGap * (cols - 1));
  const item = Math.floor(available / cols);
  return { cols, itemWidth: item };
}