'use client';

import { Pfp } from '@/app/components/ui/pfp';
import type { AdminUser } from '@/services/admin';

interface AdminUserRowProps {
  item: AdminUser;
  actingId?: string | null;
  onPressUser: (username: string) => void;
  onPressRole: (user: AdminUser) => void;
  onToggleBan: (user: AdminUser) => void;
}

export function AdminUserRow({
  item,
  actingId,
  onPressUser,
  onPressRole,
  onToggleBan,
}: AdminUserRowProps) {
  const acting = actingId === item.id;

  return (
    <button
      onClick={() => onPressUser(item.username)}
      className="flex items-center gap-3 border border-gray-300 rounded-lg p-3 w-full text-left transition hover:bg-gray-50"
    >
      <div className="w-11 h-11 shrink-0">
        <Pfp idOrUsername={item.username} size={44} />
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="font-semibold truncate">
          {item.displayName || item.username}
        </div>
        <div className="text-gray-600 text-sm truncate">
          @{item.username} • {item.role}
        </div>
        <div className="text-gray-500 text-xs">
          {new Date(item.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          disabled={acting}
          onClick={(e) => {
            e.stopPropagation();
            onPressRole(item);
          }}
          className={`border border-gray-300 rounded-md px-3 py-1 text-sm ${
            acting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
          }`}
        >
          {acting ? '...' : `Role: ${item.role}`}
        </button>

        <button
          disabled={acting}
          onClick={(e) => {
            e.stopPropagation();
            onToggleBan(item);
          }}
          className={`border border-gray-300 rounded-md px-3 py-1 text-sm ${
            acting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
          }`}
        >
          {acting ? '...' : item.isBanned ? 'Unban' : 'Ban'}
        </button>
      </div>
    </button>
  );
}