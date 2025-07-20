import type { Comment } from '@/services/comment';
import type { FC } from 'react';
import { CommentBubble } from '../CommentBubble';
import { cva } from 'class-variance-authority';

const rootContainerStyles = cva('flex items-center', {
    variants: {},
});

export interface CommentsProps {
    comments: Comment[];
    rootContainerClasses?: string;
}

export const Comments: FC<CommentsProps> = ({
    comments,
    rootContainerClasses,
}) => {
    return (
        <div
            className={rootContainerStyles({ className: rootContainerClasses })}
        >
            {comments.slice(0, 3).map((c, index) => (
                <div key={c.id} className={index > 0 ? '-ml-2' : ''}>
                    <CommentBubble data={c} />
                </div>
            ))}
            {comments.length > 3 && (
                <div className="relative z-10 -ml-2 w-8 h-8 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center font-medium">
                    +{comments.length - 3}
                </div>
            )}
        </div>
    );
};
