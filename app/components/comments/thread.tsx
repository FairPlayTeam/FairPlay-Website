'use client';

import { useState, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface User {
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

interface CommentItem {
  id: string;
  user: User;
  content: string;
  createdAt: string;
  likeCount: number;
  likedByMe: boolean;
  replies?: CommentItem[];
  _count?: { replies?: number };
}

interface CommentProps {
  comments: CommentItem[];
  replyingTo: string | null;
  replyText: string;
  onChangeReplyText: (v: string) => void;
  onPostReply: (parentId: string) => void;
  onToggleLike: (id: string) => void;
  loadMoreReplies: (id: string) => void;
  onSetReplyingTo: (id: string | null) => void;
}

function Pfp({ idOrUsername, size, avatarUrl }: { idOrUsername: string; size: number; avatarUrl?: string }) {
  const src = avatarUrl || `https://api.dicebear.com/7.x/thumbs/svg?seed=${idOrUsername}`;
  return (
    <div className="flex items-center justify-center">
      <Image
        src={src}
        alt={idOrUsername}
        width={size}
        height={size}
        className="rounded-full border border-gray-400"
      />
    </div>
  );
}

const CommentNode = memo(function CommentNode({
  n,
  depth,
  props,
}: {
  n: CommentItem;
  depth: number;
  props: CommentProps;
}) {
  const isTop = depth === 0;

  return (
    <div
      className={`flex gap-2 p-2 border rounded-lg ${isTop ? 'p-3' : 'ml-4'} border-gray-300`}
    >
      <div className="w-10 flex items-start justify-center">
        <Pfp idOrUsername={n.user.username} size={isTop ? 32 : 24} avatarUrl={n.user.avatarUrl} />
      </div>

      <div className="flex-1">
        <Link href={`/user/${n.user.username}`}>
          <span className="font-semibold block mb-1">
            {n.user.displayName || n.user.username} • @{n.user.username}
          </span>
        </Link>
        <p className="text-gray-900">{n.content}</p>
        <p className="text-gray-500 text-xs mt-1">{new Date(n.createdAt).toLocaleString()}</p>

        <div className="mt-2 flex gap-2">
          <button
            onClick={() => props.onToggleLike(n.id)}
            className="px-2 py-1 text-sm opacity-80 hover:opacity-100"
          >
            {n.likedByMe ? '♥' : '♡'} {n.likeCount}
          </button>
          <button
            onClick={() => props.onSetReplyingTo(n.id)}
            className="px-2 py-1 text-sm opacity-80 hover:opacity-100"
          >
            Reply
          </button>
        </div>

        {props.replyingTo === n.id && (
          <div className="flex gap-2 mt-2">
            <input
              value={props.replyText}
              onChange={(e) => props.onChangeReplyText(e.target.value)}
              placeholder="Reply"
              className="flex-1 border border-gray-300 rounded-lg px-2 py-1"
            />
            <button
              disabled={!props.replyText.trim()}
              onClick={() => props.onPostReply(n.id)}
              className="bg-black text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Post
            </button>
          </div>
        )}

        {n.replies && n.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {n.replies.map((child) => (
              <CommentNode key={child.id} n={child} depth={depth + 1} props={props} />
            ))}
          </div>
        )}

        {typeof n._count?.replies === 'number' &&
          (n.replies?.length || 0) < n._count.replies && (
            <button
              onClick={() => props.loadMoreReplies(n.id)}
              className="px-2 py-1 text-sm mt-2 opacity-80 hover:opacity-100"
            >
              Load more replies
            </button>
          )}
      </div>
    </div>
  );
});

export function CommentsThread(props: CommentProps) {
  return (
    <div className="p-4 space-y-3">
      {props.comments.map((c) => (
        <CommentNode key={c.id} n={c} depth={0} props={props} />
      ))}
    </div>
  );
}