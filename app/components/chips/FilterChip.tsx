'use client';

interface FilterChipProps {
  label: string;
  selected?: boolean;
  style?: string;
  onPress?: () => void;
}

export function FilterChip({ label, selected, style, onPress }: FilterChipProps) {
  return (
    <button
      onClick={onPress}
      className={`border rounded-full px-3 py-1.5 
        ${selected ? 'bg-black text-white' : 'bg-transparent text-gray-900'}
        border-gray-400 transition-colors duration-150 ${style || ''}`}
    >
      {label}
    </button>
  );
}