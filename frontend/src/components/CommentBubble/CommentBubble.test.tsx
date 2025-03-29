import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CommentBubble } from './CommentBubble';
import {
    resolveProjectComment,
    unresolveProjectComment,
} from '@/services/comment';
import * as AuthContext from '@/contexts/AuthContext';
import * as NotificationContext from '@/contexts/NotificationContext';
import type { AuthState } from '@/contexts';
import userEvent from '@testing-library/user-event';

// Mock the services
vi.mock('@/services/comment', () => ({
    resolveProjectComment: vi.fn(),
    unresolveProjectComment: vi.fn(),
}));

// Mock the context hooks
vi.mock('@/contexts/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('@/contexts/NotificationContext', () => ({
    useNotification: vi.fn(),
}));

describe('CommentBubble', () => {
    const mockComment = {
        id: '123',
        projectId: '456',
        targetId: '789',
        comment: 'This is a test comment',
        commenterId: 'user123',
        resolved: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        commenterFirstName: 'John',
        commenterLastName: 'Doe',
    };

    const mockAccessToken = 'mock-token';

    const mockPush = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup AuthContext mock
        vi.mocked(AuthContext.useAuth).mockReturnValue({
            user: null,
            companyId: null,
            accessToken: mockAccessToken,
            isLoading: false,
            setAuth: vi.fn(),
            clearAuth: vi.fn(),
            setUser: vi.fn(),
            setAccessToken: vi.fn(),
            setCompanyId: vi.fn(),
        } as AuthState);

        // Setup NotificationContext mock
        vi.mocked(NotificationContext.useNotification).mockReturnValue({
            notifications: [],
            push: mockPush,
            remove: vi.fn(),
            update: vi.fn(),
        });
    });

    const renderWithProviders = (component: React.ReactNode) => {
        return render(component);
    };

    it('renders correctly with comment data', () => {
        renderWithProviders(<CommentBubble data={mockComment} />);

        // Check if the initial state shows the first letter of the commenter's first name
        const bubbleButton = screen.getByRole('button', {
            name: /open comment/i,
        });
        expect(bubbleButton).toBeInTheDocument();
    });

    it('displays comment details when clicked', async () => {
        renderWithProviders(<CommentBubble data={mockComment} />);

        // Click the bubble to open the comment details
        const bubbleButton = screen.getByRole('button', {
            name: /open comment/i,
        });
        await userEvent.click(bubbleButton);

        // Check if comment details are displayed
        expect(screen.getByText('John')).toBeInTheDocument();
        expect(screen.getByText('Doe')).toBeInTheDocument();
        expect(screen.getByText('This is a test comment')).toBeInTheDocument();
        expect(screen.getByText('Resolve')).toBeInTheDocument();
    });

    it('handles resolve action when resolve button is clicked', async () => {
        vi.mocked(resolveProjectComment).mockResolvedValue({} as any);

        renderWithProviders(<CommentBubble data={mockComment} />);

        // Open the comment details
        const bubbleButton = screen.getByRole('button', {
            name: /open comment/i,
        });
        await userEvent.click(bubbleButton);

        // Click the resolve button
        const resolveButton = screen.getByRole('button', { name: /resolve/i });
        await userEvent.click(resolveButton);

        // Check if service was called
        await waitFor(() => {
            expect(resolveProjectComment).toHaveBeenCalledWith(
                mockAccessToken,
                mockComment.id,
                mockComment.projectId
            );
        });

        // Since we're using optimistic updates, we should immediately see "Unresolve"
        expect(screen.getByText('Unresolve')).toBeInTheDocument();
    });

    it('handles unresolve action when unresolve button is clicked', async () => {
        vi.mocked(unresolveProjectComment).mockResolvedValue({} as any);

        const resolvedComment = { ...mockComment, resolved: true };

        renderWithProviders(<CommentBubble data={resolvedComment} />);

        // Open the comment details
        const bubbleButton = screen.getByRole('button', {
            name: /open comment/i,
        });
        await userEvent.click(bubbleButton);

        // Click the unresolve button
        const unresolveButton = screen.getByRole('button', {
            name: 'Unresolve',
        });
        await userEvent.click(unresolveButton);

        // Check if service was called
        await waitFor(() => {
            expect(unresolveProjectComment).toHaveBeenCalledWith(
                mockAccessToken,
                resolvedComment.id,
                resolvedComment.projectId
            );
        });
    });

    it('closes the comment details when the close button is clicked', async () => {
        renderWithProviders(<CommentBubble data={mockComment} />);

        // Open the comment details
        const bubbleButton = screen.getByRole('button', {
            name: /open comment/i,
        });
        await userEvent.click(bubbleButton);

        // Comment details should be visible
        const commentContainer = screen.getByTestId('comment-body');
        expect(commentContainer).toHaveClass('block');

        // Click the close button
        const closeButton = screen.getByRole('button', {
            name: /close comment/i,
        });
        await userEvent.click(closeButton);

        // After clicking close, the active state should be false
        // and the container should no longer have the 'block' class
        expect(commentContainer).not.toHaveClass('block');
    });

    it('handles API errors when resolving comments', async () => {
        const error = new Error('Network error');
        vi.mocked(resolveProjectComment).mockRejectedValue(error);

        renderWithProviders(<CommentBubble data={mockComment} />);

        // Open the comment details
        const bubbleButton = screen.getByRole('button', {
            name: /open comment/i,
        });
        await userEvent.click(bubbleButton);

        // Click the resolve button
        const resolveButton = screen.getByRole('button', { name: /resolve/i });
        await userEvent.click(resolveButton);

        // Button should still show "Resolve" after error (optimistic update is reverted)
        await waitFor(() => {
            expect(screen.getByText('Resolve')).toBeInTheDocument();
        });

        // Should show notification with error message
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith({
                message:
                    "Failed to resolve comment. Make sure you're connected to the Internet.",
                level: 'error',
            });
        });
    });
});
