import type { ReactNode, HTMLAttributes } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CollapsibleSection } from './CollapsibleSection';
import userEvent from '@testing-library/user-event';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({
            children,
            ...props
        }: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) => (
            <div {...props}>{children}</div>
        ),
    },

    AnimatePresence: ({ children }: { children: ReactNode }) => children,
}));

describe('CollapsibleSection', () => {
    it('should render the title and content', () => {
        render(
            <CollapsibleSection title="Test Section">
                <div>Test Content</div>
            </CollapsibleSection>
        );

        expect(screen.getByText('Test Section')).toBeInTheDocument();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should collapse and expand when clicked', async () => {
        const user = userEvent.setup();

        render(
            <CollapsibleSection title="Test Section">
                <div>Test Content</div>
            </CollapsibleSection>
        );

        expect(screen.getByText('Test Content')).toBeInTheDocument();

        const header = screen.getByText('Test Section').parentElement;
        expect(header).not.toBeNull();
        await user.click(header!);
        expect(screen.queryByText('Test Content')).toBeNull();

        await user.click(header!);
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
});
