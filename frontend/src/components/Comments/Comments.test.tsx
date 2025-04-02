import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Comments } from './Comments';
import type { Comment } from '@/services/comment';

const mockComments: Comment[] = [
    {
        id: '1',
        projectId: 'project-1',
        targetId: 'target-1',
        comment: 'First comment',
        commenterId: 'user-1',
        resolved: false,
        createdAt: 1647896541000,
        updatedAt: 1647896541000,
        commenterFirstName: 'John',
        commenterLastName: 'Doe',
        resolvedBySnapshotId: null,
        resolvedBySnapshotAt: null,
    },
    {
        id: '2',
        projectId: 'project-1',
        targetId: 'target-2',
        comment: 'Second comment',
        commenterId: 'user-2',
        resolved: true,
        createdAt: 1647896542000,
        updatedAt: 1647896542000,
        commenterFirstName: 'Jane',
        commenterLastName: 'Smith',
        resolvedBySnapshotId: null,
        resolvedBySnapshotAt: null,
    },
];

// Mock the CommentBubble component
vi.mock('../CommentBubble', () => ({
    CommentBubble: ({ data }: { data: Comment }) => (
        <div data-testid={`comment-${data.id}`}>
            {data.comment} by {data.commenterFirstName} {data.commenterLastName}
        </div>
    ),
}));

describe('Comments', () => {
    it('renders all comments', () => {
        render(<Comments comments={mockComments} />);

        expect(screen.getByTestId('comment-1')).toBeInTheDocument();
        expect(screen.getByTestId('comment-2')).toBeInTheDocument();
    });

    it('renders empty state when no comments are provided', () => {
        render(<Comments comments={[]} />);

        expect(screen.queryByTestId(/comment-/)).not.toBeInTheDocument();
    });

    it('applies custom container classes', () => {
        const { container } = render(
            <Comments
                comments={mockComments}
                rootContainerClasses="custom-class"
            />
        );

        expect(container.firstChild).toHaveClass('custom-class');
    });
});
