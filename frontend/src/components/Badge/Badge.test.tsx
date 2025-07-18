import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components';

describe('Test Badge Component', () => {
    it('should render the given text', () => {
        render(<Badge text="test" />);
        expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('should apply the variant style', () => {
        render(<Badge text="warning" variant="warning" />);
        const badge = screen.getByText('warning').parentElement;
        expect(badge).toHaveClass(
            'bg-yellow-100 text-amber-700 border border-amber-200'
        );
    });

    it('should capitalize text when capitalizeText is true', () => {
        render(<Badge text="capitalize me" capitalizeText />);
        const textElement = screen.getByText('capitalize me');
        expect(textElement).toHaveClass('capitalize');
    });
});
