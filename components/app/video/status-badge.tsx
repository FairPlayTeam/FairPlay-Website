import { cn } from '@/lib/utils'

type BadgeLabel = 'rejected' | 'processing' | 'public' | 'private' | 'unlisted' | 'pending'

interface StatusBadgesProps {
  visibility: 'private' | 'unlisted' | 'public'
  moderationStatus: 'rejected' | 'pending' | 'approved'
  processingStatus: 'uploading' | 'processing' | 'done' | 'failed'
}

export function StatusBadges({
  visibility,
  moderationStatus,
  processingStatus,
}: StatusBadgesProps) {
  let label: BadgeLabel

  if (moderationStatus === 'rejected') {
    label = 'rejected'
  } else if (processingStatus !== 'done') {
    label = 'processing'
  } else if (moderationStatus === 'pending') {
    label = 'pending'
  } else if (visibility === 'private') {
    label = 'private'
  } else if (visibility === 'unlisted') {
    label = 'unlisted'
  } else {
    label = 'public'
  }

  return (
    <div className="absolute flex gap-1 text-xs">
      <span className="flex items-center gap-1.5 rounded-md bg-background/80 px-2 py-0.5 font-medium text-foreground backdrop-blur-md">
        <span
          className={cn(
            'size-2 rounded-full',
            label === 'rejected' && 'bg-red-500',
            label === 'processing' && 'bg-yellow-500',
            label === 'pending' && 'bg-yellow-500',
            label === 'private' && 'bg-blue-500',
            label === 'unlisted' && 'bg-slate-500',
            label === 'public' && 'bg-green-500',
          )}
        />
        {label}
      </span>
    </div>
  )
}
