type VisibilityOption = 'public' | 'unlisted' | 'private';

interface VisibilityChipsProps {
  value: VisibilityOption;
  onChange: (newValue: VisibilityOption) => void;
}

export function VisibilityChips({ value, onChange }: VisibilityChipsProps) {
  const options: VisibilityOption[] = ['public', 'unlisted', 'private'];

  return (
    <div className="flex flex-row gap-2">
      {options.map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`px-2.5 py-1.5 text-sm cursor-pointer bg-transparent rounded-full border-2 transition-colors duration-200
            ${
              value === v
                ? 'border-(--blue-500) text-(--blue-400)'
                : 'border-(--gray-300) text-(--gray-300) hover:border-(--gray-400)'
            }`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}