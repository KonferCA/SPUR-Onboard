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
    it('should render a 404 text and home link', () => {
        renderWithRouter();

        expect(screen.getByText('Oops, page not found')).toBeInTheDocument();
        expect(screen.getByText('Go Back Home')).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', '/');
    });
});
