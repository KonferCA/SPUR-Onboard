import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnchorLinks } from './AnchorLinks';
import type { AnchorLinkItem, ControlledLink } from './AnchorLinks';

/**
 * AnchorLinks Tests
 *
 * This test suite covers the AnchorLinks component functionality, with specific
 * focus on both automatic and manual scrolling behavior. The component can operate
 * in two modes:
 *
 * 1. Automatic scrolling (default): Uses the ScrollLink component to handle scrolling
 *    to the target element when a link is clicked.
 *
 * 2. Manual scrolling: Renders simple anchor tags without href attributes and relies
 *    on the parent component to handle scrolling via the onClick callback.
 *
 * The tests verify both modes of operation, custom rendering capabilities, and styling options.
 */

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

        // Check that we're rendering plain anchor tags without href
        const linkElement = listItems[0].querySelector('a');
        expect(linkElement).not.toBeNull();
        expect(linkElement?.tagName).toBe('A');
        expect(linkElement?.getAttribute('href')).toBeNull();
    });

    it('should render different link types based on manualScroll prop', () => {
        // With manualScroll=false (default), it should use ScrollLink component
        const { container: container1 } = render(<AnchorLinks links={links} />);

        // With automatic scrolling, it should contain ScrollLink components
        // We can check for basic structure differences
        const autoScrollLinks = container1.querySelectorAll('li');
        expect(autoScrollLinks.length).toBe(links.length);

        // With manualScroll=true, it should use plain <a> tags
        const { container: container2 } = render(
            <AnchorLinks links={links} manualScroll />
        );

        // Should use plain <a> tags without href
        const linkElements = container2.querySelectorAll('a');
        expect(linkElements.length).toBe(links.length);
        linkElements.forEach((link) => {
            expect(link.getAttribute('href')).toBeNull();
        });
    });

    it('should use custom rendering for both manual and automatic scrolling', () => {
        const customRenderer = (link: ControlledLink) => (
            <span data-testid={`custom-${link.label}`}>{link.label}</span>
        );

        // Test with manualScroll=true
        const { rerender } = render(
            <AnchorLinks links={links} manualScroll children={customRenderer} />
        );

        links.forEach((link) => {
            expect(
                screen.getByTestId(`custom-${link.label}`)
            ).toBeInTheDocument();
        });

        // Test with manualScroll=false
        rerender(<AnchorLinks links={links} children={customRenderer} />);

        links.forEach((link) => {
            expect(
                screen.getByTestId(`custom-${link.label}`)
            ).toBeInTheDocument();
        });
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
