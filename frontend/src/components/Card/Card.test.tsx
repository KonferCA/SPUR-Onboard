import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '@/components';

describe('Test Card Component', () => {
    it('should render the given text', () => {
        render(
            <Card>
                <div>
                    <span>Card content</span>
                    <button>My button</button>
                </div>
            </Card>
        );
        expect(screen.getByText('Card content')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'My button' })
        ).toBeInTheDocument();
    });

    it('should render nothing as children', () => {
        const { container } = render(<Card></Card>);
        const elements = container.querySelectorAll('*');
        // only the root/Card component
        expect(elements.length).toEqual(1);
    });
});
