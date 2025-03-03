import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnchorLinks } from './AnchorLinks';
import type { AnchorLinkItem, ControlledLink } from './AnchorLinks';

describe('AnchorLinks', () => {
    const links: AnchorLinkItem[] = [
        {
            label: 'one',
            target: '#one',
        },
        {
            label: 'two',
            target: '#two',
            offset: 10,
        },
    ];

    it('should render all provided links', () => {
        render(<AnchorLinks links={links} />);
        const found = screen.getAllByRole('listitem');
        expect(found).toHaveLength(links.length);
        found.forEach((link, i) => {
            expect(link.textContent).toContain(links[i].label);
        });
    });

    it('should render all provided links using rendering function', () => {
        render(
            <AnchorLinks links={links}>
                {(link: ControlledLink) => <button>{link.label}</button>}
            </AnchorLinks>
        );
        links.forEach((link) => {
            expect(() =>
                screen.getByRole('button', { name: link.label })
            ).not.toThrow();
        });
    });

    it('should handle manual scroll mode correctly', () => {
        const mockOnClick = vi.fn();
        render(
            <AnchorLinks links={links} manualScroll onClick={mockOnClick} />
        );

        const listItems = screen.getAllByRole('listitem');
        fireEvent.click(listItems[0]);

        expect(mockOnClick).toHaveBeenCalledTimes(1);
        const linkElement = listItems[0].querySelector('a');
        expect(linkElement).not.toBeNull();
        expect(linkElement?.tagName).toBe('A');
        expect(linkElement?.getAttribute('href')).toBeNull();
    });

    it('should apply yGap class correctly', () => {
        const { container, rerender } = render(
            <AnchorLinks links={links} yGap="sm" />
        );
        const ulElement = container.querySelector('ul');
        expect(ulElement?.className).toContain('gap-2');

        rerender(<AnchorLinks links={links} yGap="md" />);
        expect(ulElement?.className).toContain('gap-4');

        rerender(<AnchorLinks links={links} yGap="lg" />);
        expect(ulElement?.className).toContain('gap-6');

        rerender(<AnchorLinks links={links} />);
        expect(ulElement?.className).toContain('gap-2'); // default value
    });
});
