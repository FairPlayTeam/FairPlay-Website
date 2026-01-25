"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow } from "date-fns";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import { useAuth } from "@/context/AuthContext";
import { FaThumbsUp, FaRegThumbsUp, FaReply, FaTrash } from "react-icons/fa";
import {
  addComment,
  deleteComment,
  getCommentReplies,
  likeComment,
  unlikeComment,
  CommentItem,
} from "@/lib/video";
import * as z from "zod";
import UserAvatar from "@/components/ui/UserAvatar";
import { api } from "@/lib/api";

const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment is required")
    .max(500, "Comment cannot be longer than 500 characters."),
});

type CommentForm = z.infer<typeof commentSchema>;

interface CommentsProps {
  videoId: string;
  initialComments: CommentItem[];
}

interface CommentProps {
  comment: CommentItem;
  videoId: string;
  onReplySuccess?: () => void;
  onDelete?: (commentId: string) => void;
}

function Comment({ comment, videoId, onReplySuccess, onDelete }: CommentProps) {
  const { user } = useAuth();

  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [showReplies, setShowReplies] = useState<boolean>(false);

  const [isLoadingReplies, setIsLoadingReplies] = useState<boolean>(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [replies, setReplies] = useState<CommentItem[]>([]);
  const [localComment, setLocalComment] = useState<CommentItem>(comment);

  const isStaff = user?.role === "moderator" || user?.role === "admin";
  const canDelete = !!user && (user.id === localComment.user.id || isStaff);
  const isDeleted = localComment.content === "[deleted]";

  const form = useForm<CommentForm>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async ({ content }: CommentForm) => {
    setIsSubmittingReply(true);
    try {
      const response = await addComment(videoId, content, comment.id);

      setReplies([response.data.comment, ...replies]);
      setIsReplying(false);
      setShowReplies(true);

      form.setValue("content", "");

      onReplySuccess?.();
    } catch (error) {
      console.error("Failed to post reply:", error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleLike = async () => {
    if (!user) return;

    try {
      if (localComment.likedByMe) {
        await unlikeComment(comment.id);

        setLocalComment((prev) => ({
          ...prev,
          likeCount: prev.likeCount - 1,
          likedByMe: false,
        }));
      } else {
        await likeComment(comment.id);

        setLocalComment((prev) => ({
          ...prev,
          likeCount: prev.likeCount + 1,
          likedByMe: true,
        }));
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const fetchReplies = async () => {
    if (replies.length > 0) {
      setShowReplies(!showReplies);
      return;
    }

    setIsLoadingReplies(true);

    try {
      const response = await getCommentReplies(comment.id);

      setReplies(response.data.replies);
      setShowReplies(true);
    } catch (error) {
      console.error("Failed to fetch replies:", error);
    } finally {
      setIsLoadingReplies(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      const response = await deleteComment(localComment.id);
      const message = response.data?.message ?? "";
      const wasSoftDeleted = message.toLowerCase().includes("soft");

      if (wasSoftDeleted || (localComment._count?.replies ?? 0) > 0) {
        setLocalComment((prev) => ({ ...prev, content: "[deleted]" }));
        return;
      }

      onDelete?.(localComment.id);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReplyDelete = (commentId: string) => {
    setReplies((prev) => prev.filter((reply) => reply.id !== commentId));
    setLocalComment((prev) => {
      if (typeof prev._count?.replies !== "number") return prev;
      return {
        ...prev,
        _count: {
          ...prev._count,
          replies: Math.max(prev._count.replies - 1, 0),
        },
      };
    });
  };

  return (
    <div className="flex gap-4">
      <UserAvatar user={localComment.user} size={40} />
      <div className="flex-1">
        <Link href={"/channel/" + localComment.user.username}>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-text">
              {localComment.user.displayName || localComment.user.username}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(localComment.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </Link>

        <p className="text-sm text-text whitespace-pre-wrap">
          {localComment.content}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex flex-row gap-1 items-center text-sm">
            <Button
              size="icon-sm"
              variant="ghost"
              className="rounded-full text-text hover:bg-white/5"
              onClick={handleLike}
              disabled={!user}
            >
              {localComment.likedByMe ? <FaThumbsUp /> : <FaRegThumbsUp />}
            </Button>
            {localComment.likeCount > 0 && (
              <span>{localComment.likeCount}</span>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsReplying(!isReplying)}
            disabled={!user}
            className="text-text-para hover:bg-white/5 flex text-sm gap-2 rounded-full"
          >
            <FaReply /> Reply
          </Button>
          {canDelete && !isDeleted && (
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-full text-text-para hover:bg-white/5"
              title="Delete comment"
              aria-label="Delete comment"
            >
              <FaTrash />
            </Button>
          )}
        </div>

        {isReplying && (
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 mb-4">
            <div className="flex gap-3">
              <UserAvatar user={user} size={32} />
              <div className="flex-1">
                <Textarea
                  {...form.register("content")}
                  placeholder="Add a reply..."
                  className="min-h-16 text-sm"
                />
                {form.formState.errors.content && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.content.message as string}
                  </p>
                )}
                <div className="flex gap-3 justify-end mt-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsReplying(false)}
                    disabled={isSubmitting}
                    className="text-text-para hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    type="submit"
                    disabled={
                      isSubmitting || !!form.getValues("content").trim()
                    }
                  >
                    {isSubmittingReply ? "Replying..." : "Reply"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}

        {(localComment._count?.replies || 0) > 0 && (
          <div className="mt-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={fetchReplies}
              className="text-xs hover:bg-white/5"
            >
              {showReplies ? "Hide" : `View ${localComment._count?.replies}`}{" "}
              {localComment._count?.replies === 1 ? "Reply" : "Replies"}
            </Button>
          </div>
        )}

        {showReplies && (
          <div className="mt-4 space-y-4 pl-4 border-l-2 border-border">
            {isLoadingReplies && (
              <div className="text-xs text-text-footer">Loading replies...</div>
            )}
            {replies.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
                videoId={videoId}
                onDelete={handleReplyDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function Comments({ videoId, initialComments }: CommentsProps) {
  const { user } = useAuth();

  const [comments, setComments] = useState<CommentItem[]>(initialComments);

  const form = useForm<CommentForm>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: CommentForm) => {
    try {
      const response = await addComment(videoId, values.content);

      setComments([response.data.comment, ...comments]);
      form.reset();
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  const handleCommentDelete = (commentId: string) => {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
  };

  return (
    <div id="comments" className="mt-8 mb-6">
      <h3 className="text-xl font-bold mb-6 mx-2 text-text">
        {comments.length} Comments
      </h3>

      {user ? (
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mb-8 flex gap-4"
        >
          <UserAvatar user={user} size={40} />
          <div className="flex-1">
            <Textarea
              {...form.register("content")}
              placeholder="Add a comment..."
            />
            {form.formState.errors.content && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.content.message as string}
              </p>
            )}

            <div className="flex gap-3 justify-end mt-1">
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={() => form.reset()}
                className="text-text-para hover:bg-white/5"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                type="submit"
                disabled={isSubmitting || !!form.getValues("content").trim()}
              >
                {isSubmitting ? "Posting..." : "Comment"}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 flex flex-col items-center gap-4">
          <p>Please login to comment</p>
          <Link href={`/login?callbackUrl=/video/${videoId}#comments`}>
            <Button size="sm" variant="secondary" className="px-4 py-2">
              Login
            </Button>
          </Link>
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            videoId={videoId}
            onDelete={handleCommentDelete}
          />
        ))}
      </div>
    </div>
  );
}
