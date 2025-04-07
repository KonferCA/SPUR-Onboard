import {
    resolveProjectComment,
    unresolveProjectComment,
    type Comment,
} from '@/services/comment';
import { cva } from 'class-variance-authority';
import { type FC, useCallback, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { FaXmark, FaCheck } from 'react-icons/fa6';
import { useAuth, useNotification } from '@/contexts';
import { ApiError } from '@/services';
import { format, fromUnixTime } from 'date-fns';

const commentInfoContainerStyles = cva(
    'absolute rounded-lg -top-2 -left-2 p-2 border border-gray-300 shadow-lg bg-white hidden min-w-72 min-h-16 z-50',
    {
        variants: {
            active: {
                true: 'block',
            },
        },
    }
);

const commentResolveButtonStyles = cva(
    'border border-gray-400 rounded py-1 px-2 text-sm flex items-center justify-center gap-2',
    {
        variants: {
            resolved: {
                true: 'text-red-600',
                false: 'text-green-700',
            },
        },
    }
);

export interface CommentBubbleProps {
    data: Comment;
}

export const CommentBubble: FC<CommentBubbleProps> = ({ data }) => {
    const [active, setActive] = useState(false);
    const [comment, setComment] = useState(data);
    const notifications = useNotification();
    const { getAccessToken } = useAuth();

    const onToggleResolution = useCallback(
        async (comment: Comment) => {
            const accessToken = getAccessToken();
            if (!accessToken) return;
            const originalResolvedState = comment.resolved;
            try {
                // Optimistic update
                setComment({ ...comment, resolved: !comment.resolved });
                if (comment.resolved) {
                    await unresolveProjectComment(
                        accessToken,
                        comment.id,
                        comment.projectId
                    );
                } else {
                    await resolveProjectComment(
                        accessToken,
                        comment.id,
                        comment.projectId
                    );
                }
            } catch (error) {
                // Reverse optimistic update
                setComment({ ...comment, resolved: originalResolvedState });
                let message = '';
                if (error instanceof ApiError) {
                    message =
                        (error.body as { message: string }).message ||
                        error.message;
                }
                notifications.push({
                    message:
                        message ||
                        "Failed to resolve comment. Make sure you're connected to the Internet.",
                    level: 'error',
                });
            }
        },
        [getAccessToken, notifications.push]
    );

    return (
        <div className="relative">
            <div
                data-testid="comment-body"
                className={twMerge(
                    commentInfoContainerStyles({ active: active })
                )}
            >
                <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                        <span>{comment.commenterFirstName || 'First'}</span>
                        <span>{comment.commenterLastName || 'Last'}</span>
                    </div>
                    <div className="flex items-center">
                        <button
                            type="button"
                            aria-label="close comment"
                            onClick={() => setActive(false)}
                        >
                            <FaXmark className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                <div className="mt-2">
                    <span>{comment.comment}</span>
                </div>
                <div className="mt-2 flex justify-end">
                    {comment.resolvedBySnapshotId === null && (
                        <button
                            type="button"
                            className={commentResolveButtonStyles({
                                resolved: comment.resolved,
                            })}
                            onClick={() => onToggleResolution(comment)}
                            disabled={comment.resolvedBySnapshotId !== null}
                        >
                            <span>
                                {comment.resolved ? 'Unresolve' : 'Resolve'}
                            </span>
                            {!comment.resolved && (
                                <span>
                                    <FaCheck />
                                </span>
                            )}
                        </button>
                    )}
                    {comment.resolvedBySnapshotAt !== null && (
                        <p className="text-sm text-gray-400">{`Resolved on ${format(fromUnixTime(comment.resolvedBySnapshotAt), 'MMM d, yyyy h:mm a zzz')}`}</p>
                    )}
                </div>
            </div>
            <button
                type="button"
                aria-label="open comment"
                onClick={() => setActive((p) => !p)}
                className="relative bg-white w-8 h-8 rounded-full border border-gray-300 p-2 flex items-center justify-center z-10"
            >
                <span>{comment.commenterFirstName?.at(0) || ''}</span>
            </button>
        </div>
    );
};
