import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SectionDrawer } from './SectionDrawer';
import type {
    SectionDrawerProps,
    SectionDrawerLinkItem,
} from './SectionDrawer.types';

/**
 * This test suite doesn't test all aspects of the SectionDrawer component
 * due to the following limitations:
 *
 * 1. Complex UI interactions - The drawer uses animation and state transitions
 *    that are difficult to test in a JSDOM environment. For example, testing if
 *    clicking the drawer trigger actually opens the drawer.
 *
 * 2. Animation behavior - framer-motion animations like collapse/expand are
 *    mocked rather than fully simulated.
 *
 * 3. Scroll behavior - The component has scroll event handlers that update
 *    the active subsection, which is difficult to test without a real browser.
 *
 * 4. User interactions - Testing collapsible sections by clicking buttons
 *    would require complex userEvent setup that isn't feasible in this environment.
 *
 * 5. Component state - Internal state like isSubSectionsCollapse and
 *    activeSubSection are not directly testable without exposing them.
 *
 * These aspects would be better covered by end-to-end tests using Playwright with vitest browser setup.
 */

// Mock dependencies
vi.mock('@/utils', () => ({
    isElementInView: vi.fn().mockReturnValue(true),
    scrollToWithOffset: vi.fn(),
}));

vi.mock('framer-motion', () => ({
    motion: {
        // biome-ignore lint: mocking props
        div: ({ children, ...props }: any) => (
            <div data-testid={props['data-testid']} {...props}>
                {children}
            </div>
        ),

        // biome-ignore lint: mocking props
        span: ({ children, ...props }: any) => (
            <span data-testid={props['data-testid']} {...props}>
                {children}
            </span>
        ),
    },
}));

describe('SectionDrawer', () => {
    const mockSubSectionLinks: SectionDrawerLinkItem[] = [
        {
            label: 'Subsection 1',
            target: '#subsection1',
        },
        {
            label: 'Subsection 2',
            target: '#subsection2',
        },
    ];

    const mockValidationErrors = [
        {
            section: 'Section 1',
            subsection: 'Subsection 1',
            questionText: 'Question 1',
            inputType: 'text',
            required: true,
            value: '',
            reason: 'This field is required',
        },
    ];

    const mockRecommendedFields = [
        {
            section: 'Section 1',
            subsection: 'Subsection 2',
            questionText: 'Optional Question 1',
            inputType: 'text',
        },
    ];

    const mockOnRequestChangeSection = vi.fn().mockReturnValue(true);

    const defaultProps: SectionDrawerProps = {
        activeSection: 'Section 1',
        subSectionLinks: mockSubSectionLinks,
        validationErrors: [],
        recommendedFields: [],
        onRequestChangeSection: mockOnRequestChangeSection,
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock document.querySelector for subsection elements
        document.querySelector = vi.fn().mockImplementation((selector) => {
            if (selector === '#subsection1' || selector === '#subsection2') {
                return {
                    getBoundingClientRect: () => ({ top: 100 }),
                };
            }
            return null;
        });
    });

    it('should render drawer trigger with active section title', () => {
        render(<SectionDrawer {...defaultProps} />);
        expect(screen.getByText('Section 1')).toBeInTheDocument();
    });

    it('should display validation error message when errors exist', () => {
        render(
            <SectionDrawer
                {...defaultProps}
                validationErrors={mockValidationErrors}
            />
        );
        expect(
            screen.getAllByText(/Oops! You're missing information/i)[0]
        ).toBeInTheDocument();
    });

    it('should display the Recommended Fields section when recommendedFields exist', async () => {
        // Passing the mock validation errors to tricker open drawer on mount.
        // The drawer component from shadcn depends on a browser API that will take too much to mock
        // and we can assume that the drawer has been well tested by shadcn.
        render(
            <SectionDrawer
                {...defaultProps}
                validationErrors={mockValidationErrors}
                recommendedFields={mockRecommendedFields}
            />
        );
        await waitFor(() =>
            expect(screen.getByText(/recommended fields/i)).toBeInTheDocument()
        );
    });
});
