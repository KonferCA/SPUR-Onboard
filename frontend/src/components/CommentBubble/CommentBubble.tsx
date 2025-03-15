import type { Comment } from '@/services/comment';
import { cva } from 'class-variance-authority';
import { type FC, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { FaXmark } from 'react-icons/fa6';

const commentInfoContainerStyles = cva(
    'absolute rounded-lg -top-2 -left-2 p-2 border border-gray-300 shadow-lg bg-white hidden min-w-64 min-h-16 z-50',
    {
        variants: {
            active: {
                true: 'block',
            },
        },
    }
);

export interface CommentBubbleProps {
    data: Comment;
}

export const CommentBubble: FC<CommentBubbleProps> = ({ data }) => {
    const [active, setActive] = useState(false);
    return (
        <div className="relative">
            <div
                className={twMerge(
                    commentInfoContainerStyles({ active: active })
                )}
            >
                <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                        <span>{data.commenterFirstName || 'First'}</span>
                        <span>{data.commenterLastName || 'Last'}</span>
                    </div>
                    <div className="flex items-center">
                        <button type="button" onClick={() => setActive(false)}>
                            <FaXmark className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                <div className="mt-2">
                    <span>{data.comment}</span>
                </div>
            </div>
            <button
                type="button"
                onClick={() => setActive((p) => !p)}
                className="relative w-8 h-8 rounded-full border border-gray-300 p-2 flex items-center justify-center z-10"
            >
                <span>{data.commenterFirstName?.at(0) || ''}</span>
            </button>
        </div>
    );
};
