import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
