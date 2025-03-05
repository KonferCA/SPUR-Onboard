import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotFound } from './NotFound';
import {
    createRouter,
    RouterProvider,
    createRootRoute,
} from '@tanstack/react-router';

const renderWithRouter = () => {
    const rootRoute = createRootRoute();
    const router = createRouter({
        routeTree: rootRoute,
        context: {
            auth: undefined,
        },
        defaultComponent: NotFound,
        defaultNotFoundComponent: NotFound,
    });

    return render(<RouterProvider router={router} />);
};

describe('NotFound Component', () => {
    it('should render the not found text and back to dashboard link', () => {
        renderWithRouter();

        expect(screen.getByText('Page Not Found')).toBeInTheDocument();
        expect(
            screen.getByText(/We're sorry, the page you're looking for/)
        ).toBeInTheDocument();
        expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', '/');
    });
});
