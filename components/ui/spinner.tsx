'use client'

import { cn } from '@/lib/utils'

interface SpinnerProps {
  className?: string
}

export function Spinner({ className }: SpinnerProps) {
  return (
    <svg viewBox="0 0 100 100" className={cn('size-16', className)} fill="none">
      <style>{`
        @keyframes triangle-spin {
          to { stroke-dashoffset: -160; }
        }
        .triangle-loader {
          stroke-dasharray: 48 112;
          stroke-dashoffset: 0;
          animation: triangle-spin 1.2s linear infinite;
          color: var(--blue-pastel-100);
        }
      `}</style>
      <polygon
        points="35,20 75,50 35,80"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="triangle-loader"
      />
    </svg>
  )
}
