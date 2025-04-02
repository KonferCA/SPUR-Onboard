import type { Comment } from '@/services/comment';
import type { FC } from 'react';
import { CommentBubble } from '../CommentBubble';
import { cva } from 'class-variance-authority';

const rootContainerStyles = cva('flex items-center gap-3', {
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
            {comments.map((c) => (
                <div key={c.id}>
                    <CommentBubble data={c} />
                </div>
            ))}
        </div>
    );
};
