import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  trackClassName?: string;
  rangeClassName?: string;
  thumbClassName?: string;
  onChange: (value: number) => void;
}

export default function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  className,
  trackClassName,
  rangeClassName,
  thumbClassName,
  ...props
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div
      className={cn(
        "relative flex items-center select-none touch-none w-full h-5 cursor-pointer",
        className
      )}
    >
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        {...props}
      />
      <div
        className={cn(
          "relative w-full h-1.5 bg-white/20 rounded-full overflow-hidden",
          trackClassName
        )}
      >
        <div
          className={cn(
            "absolute top-0 left-0 h-full bg-accent rounded-full",
            rangeClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 size-3 bg-accent rounded-full pointer-events-none transition-transform",
          thumbClassName
        )}
        style={{
          left: `calc(${percentage}% - 6px)`,
        }}
      />
    </div>
  );
}
