"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import UserAvatar from "@/components/ui/user-avatar";
import { useAuth } from "@/context/auth-context";
import { buildAuthHref, buildServiceUnavailableHref } from "@/lib/safe-redirect";
import { cn } from "@/lib/utils";
import { ThumbsUp, Reply, Trash2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  addComment,
  deleteComment,
  getCommentReplies,
  likeComment,
  unlikeComment,
  CommentItem,
} from "@/lib/comments";
import * as z from "zod";

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
  allowComments?: boolean;
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
  const replyContent = useWatch({ control: form.control, name: "content" }) ?? "";

  const onSubmit = async ({ content }: CommentForm) => {
    setIsSubmittingReply(true);
    try {
      const response = await addComment(videoId, content, comment.id);

      setReplies((prev) => [response.data.comment, ...prev]);
      setIsReplying(false);
      setShowReplies(true);

      form.setValue("content", "");

      onReplySuccess?.();
    } catch {
      toast.error("Failed to post reply.");
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
    } catch {
      toast.error("Failed to update like.");
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
    } catch {
      toast.error("Failed to load replies.");
    } finally {
      setIsLoadingReplies(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      const response = await deleteComment(localComment.id);
      const wasSoftDeleted = response.data?.deletionMode === "soft";

      if (wasSoftDeleted) {
        setLocalComment((prev) => ({ ...prev, content: "[deleted]" }));
        return;
      }

      onDelete?.(localComment.id);
    } catch {
      toast.error("Failed to delete comment.");
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
      <UserAvatar user={localComment.user} size="lg" />
      <div className="flex flex-col gap-2 w-full">
        <Link href={"/channel/" + localComment.user.username}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {localComment.user.displayName || localComment.user.username}
            </span>

            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(localComment.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </Link>

        <p className="text-sm text-foreground whitespace-pre-wrap">{localComment.content}</p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm">
            <Button
              size="icon-sm"
              variant="ghost"
              className="rounded-full text-foreground hover:bg-accent"
              onClick={handleLike}
              disabled={!user}
              aria-label={localComment.likedByMe ? "Unlike comment" : "Like comment"}
            >
              {localComment.likedByMe ? <ThumbsUp className="fill-current" /> : <ThumbsUp />}
            </Button>
            {localComment.likeCount > 0 && <span>{localComment.likeCount}</span>}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsReplying(!isReplying)}
            disabled={!user}
            className="flex items-center gap-2 rounded-full text-sm text-foreground hover:bg-accent"
            aria-label={isReplying ? "Cancel reply" : "Reply to comment"}
          >
            <Reply /> Reply
          </Button>
          {canDelete && !isDeleted && (
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-full"
              title="Delete comment"
              aria-label="Delete comment"
            >
              <Trash2 />
            </Button>
          )}
        </div>

        {isReplying && (
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 mb-4">
            <div className="flex gap-3">
              <UserAvatar user={user} size="lg" />
              <div className="flex-1">
                <Textarea
                  {...form.register("content")}
                  placeholder="Add a reply..."
                  className="min-h-16 text-sm"
                />
                {form.formState.errors.content && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.content.message as string}
                  </p>
                )}
                <div className="flex gap-1 justify-end mt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() => setIsReplying(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    type="submit"
                    disabled={isSubmitting || !replyContent.trim()}
                  >
                    {isSubmittingReply ? "Replying..." : "Reply"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}

        {(localComment._count?.replies || 0) > 0 && (
          <div className="mt-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={fetchReplies}
              className="text-xs hover:bg-accent flex items-center gap-1"
            >
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-300",
                  showReplies && "rotate-180",
                )}
              />
              {showReplies ? "Hide" : `View ${localComment._count?.replies}`}{" "}
              {localComment._count?.replies === 1 ? "Reply" : "Replies"}
            </Button>
          </div>
        )}

        {showReplies && (
          <div className="mt-4 space-y-4 pl-4 border-l-2 border-border">
            {isLoadingReplies && (
              <div className="text-xs text-muted-foreground">Loading replies...</div>
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

export function Comments({ videoId, initialComments, allowComments = true }: CommentsProps) {
  const { user, isUnavailable, errorMessage } = useAuth();

  const [comments, setComments] = useState<CommentItem[]>(initialComments);

  const form = useForm<CommentForm>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" },
  });

  const isSubmitting = form.formState.isSubmitting;
  const commentContent = useWatch({ control: form.control, name: "content" }) ?? "";

  const onSubmit = async (values: CommentForm) => {
    try {
      const response = await addComment(videoId, values.content);

      setComments((prev) => [response.data.comment, ...prev]);
      form.reset();
    } catch {
      toast.error("Failed to post comment.");
    }
  };

  const handleCommentDelete = (commentId: string) => {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
  };

  return (
    <div id="comments" className="mt-6 mb-6">
      <h3 className="mb-6 text-xl font-bold text-foreground">{comments.length} Comments</h3>
      {!allowComments ? (
        <div className="mb-8 p-4 flex flex-col items-center gap-4 text-muted-foreground text-sm">
          <p>Comments are disabled for this video.</p>
        </div>
      ) : isUnavailable && !user ? (
        <div className="mb-8 flex flex-col items-center gap-4 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            {errorMessage ?? "Authentication is temporarily unavailable, so posting comments is disabled."}
          </p>
          <Link href={buildServiceUnavailableHref(`/video/${videoId}#comments`)}>
            <Button variant="outline" className="rounded-full px-4 py-2 text-sm font-semibold">
              Auth unavailable
            </Button>
          </Link>
        </div>
      ) : user ? (
        <form onSubmit={form.handleSubmit(onSubmit)} className="mb-6 flex gap-4">
          <UserAvatar user={user} size="lg" />
          <div className="flex-1">
            <Textarea {...form.register("content")} placeholder="Add a comment..." />
            {form.formState.errors.content && (
              <p className="text-sm text-destructive">
                {form.formState.errors.content.message as string}
              </p>
            )}

            <div className="flex gap-1 justify-end mt-1">
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={() => form.reset()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="secondary"
                type="submit"
                disabled={isSubmitting || !commentContent.trim()}
              >
                {isSubmitting ? "Posting..." : "Comment"}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 flex flex-col items-center gap-4">
          <p>Please login to comment</p>
          <Link href={buildAuthHref("/login", `/video/${videoId}#comments`)}>
            <Button variant="outline" className="rounded-full px-4 py-2 text-sm font-semibold">
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
