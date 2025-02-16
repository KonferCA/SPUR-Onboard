import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components';

describe('Test Badge Component', () => {
    it('should render the given text', () => {
        render(<Badge text="test" />);
        expect(screen.getByText('test')).toBeInTheDocument();
    });
});
