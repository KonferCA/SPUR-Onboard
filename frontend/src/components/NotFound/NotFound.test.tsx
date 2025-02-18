import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotFound } from './NotFound';

describe('NotFound Component', () => {
    it('should render a 404 text', () => {
        render(<NotFound />);
        expect(screen.getByText('Oops, page not found')).toBeInTheDocument();
    });
});
