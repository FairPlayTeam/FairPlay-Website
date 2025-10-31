import React, { ReactElement, useMemo } from 'react';

interface VideoGridProps<T> {
  data: T[];
  renderItem: (item: T) => ReactElement;
  keyExtractor: (item: T) => string;
  contentPadding?: number;
  gap?: number;
  contentEdgeOnWeb?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  ListEmptyComponent?: ReactElement | null;
  extraContentHeader?: ReactElement | null;
  width: number;
}

const defaultPadding = 16;
const defaultGap = 8;

const computeItemWidth = (width: number, padding: number, gap: number) => {
  const cols = Math.floor((width + gap) / (180 + gap));
  const itemWidth = (width - padding * 2 - gap * (cols - 1)) / cols;
  return { cols, itemWidth };
};

export default function VideoGrid<T>({
  data,
  renderItem,
  keyExtractor,
  contentPadding = defaultPadding,
  gap = defaultGap,
  contentEdgeOnWeb = false,
  refreshing = false,
  onRefresh,
  ListEmptyComponent = null,
  extraContentHeader = null,
  width,
}: VideoGridProps<T>) {
  const { cols, itemWidth } = useMemo(
    () => computeItemWidth(width, contentPadding, gap),
    [width, contentPadding, gap]
  );

  return (
    <div
      className={`w-full ${contentEdgeOnWeb ? 'px-0' : `px-[${contentPadding}px]`} pb-6`}
      style={{ gap: `${gap}px` }}
    >
      {extraContentHeader}
      {data.length === 0 ? (
        ListEmptyComponent
      ) : (
        <div
          className="flex flex-wrap"
          style={{ gap: `${gap}px`, width: '100%' }}
        >
          {data.map((item) => (
            <div
              key={keyExtractor(item)}
              style={{ width: `${itemWidth}px`, flexBasis: `${itemWidth}px` }}
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}