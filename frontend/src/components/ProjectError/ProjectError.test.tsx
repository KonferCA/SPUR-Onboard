import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectError } from './ProjectError';
import type { ValidationError } from '@/types/project';

// mock MdIcons with test IDs
vi.mock('react-icons/md', () => ({
    MdKeyboardArrowDown: () => <span data-testid="arrow-down">ArrowDown</span>,
    MdKeyboardArrowUp: () => <span data-testid="arrow-up">ArrowUp</span>,
    MdErrorOutline: () => <span data-testid="error-icon">ErrorOutline</span>,
    MdChevronLeft: () => <span data-testid="chevron-left">ChevronLeft</span>,
    MdClose: () => <span data-testid="close-icon">Close</span>,
}));

// mock sanitizeHtmlId utility
vi.mock('@/utils/html', () => ({
    sanitizeHtmlId: (str: string) => str.toLowerCase().replace(/\s+/g, '-'),
}));

describe('ProjectError', () => {
    const mockErrors: ValidationError[] = [
        {
            section: 'Financials',
            subsection: 'Revenue Details',
            questionText: 'What is the current revenue?',
            inputType: 'textinput',
            required: true,
            value: '',
            reason: 'Missing required value',
            questionId: 'revenue-1',
        },
        {
            section: 'Team',
            subsection: 'Core Members',
            questionText: 'Add team members',
            inputType: 'multiselect',
            required: true,
            value: [],
            reason: 'Missing required value',
            questionId: 'team-1',
        },
    ];

    const mockOnErrorClick = vi.fn();
    const mockOnToggle = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders nothing when no errors', () => {
        const { container } = render(
            <ProjectError errors={[]} onErrorClick={mockOnErrorClick} />
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('renders error panel with correct error count', () => {
        render(
            <ProjectError
                errors={mockErrors}
                onErrorClick={mockOnErrorClick}
                isOpen
                onToggle={mockOnToggle}
            />
        );

        expect(
            screen.getByText('2 Required Fields Missing')
        ).toBeInTheDocument();
        expect(screen.getByTestId('chevron-left')).toBeInTheDocument();
        expect(screen.getByTestId('close-icon')).toBeInTheDocument();
    });

    it('toggles visibility when close button is clicked', () => {
        render(
            <ProjectError
                errors={mockErrors}
                onErrorClick={mockOnErrorClick}
                isOpen
                onToggle={mockOnToggle}
            />
        );

        fireEvent.click(screen.getByTestId('close-icon'));
        expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('shows collapsed state with left arrow', () => {
        render(
            <ProjectError
                errors={mockErrors}
                onErrorClick={mockOnErrorClick}
                isOpen={false}
                onToggle={mockOnToggle}
            />
        );

        const toggleButton = screen.getByTestId('chevron-left');
        expect(toggleButton).toBeVisible();
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('groups errors by section', () => {
        render(
            <ProjectError
                errors={mockErrors}
                onErrorClick={mockOnErrorClick}
                isOpen
                onToggle={mockOnToggle}
            />
        );

        expect(screen.getByText('Financials')).toBeInTheDocument();
        expect(screen.getByText('Team')).toBeInTheDocument();
        expect(screen.getAllByText('1 error')).toHaveLength(2);
    });

    it('expands and collapses sections when clicking section headers', () => {
        const mockErrors: ValidationError[] = [
            {
                section: 'Financials',
                subsection: 'Revenue Details',
                questionText: 'Current revenue?',
                inputType: 'textinput',
                required: true,
                value: '',
                reason: 'Missing required value',
                questionId: 'revenue-1',
            },
            {
                section: 'Financials',
                subsection: 'Costs',
                questionText: 'Operating costs?',
                inputType: 'textinput',
                required: true,
                value: '',
                reason: 'Missing required value',
                questionId: 'costs-1',
            },
        ];

        render(
            <ProjectError
                errors={mockErrors}
                onErrorClick={mockOnErrorClick}
                isOpen
                onToggle={mockOnToggle}
            />
        );

        // get section header
        const sectionHeader = screen.getByText('Financials').closest('button')!;

        // initial state - collapsed
        expect(screen.getByTestId('arrow-down')).toBeVisible();
        expect(screen.queryByText('Current revenue?')).not.toBeInTheDocument();

        // click to expand
        fireEvent.click(sectionHeader);
        expect(screen.getByTestId('arrow-up')).toBeVisible();
        expect(screen.getByText('Current revenue?')).toBeVisible();

        // click to collapse
        fireEvent.click(sectionHeader);
        expect(screen.getByTestId('arrow-down')).toBeVisible();
        expect(screen.queryByText('Current revenue?')).not.toBeInTheDocument();
    });

    it('handles error clicks and closes panel', () => {
        render(
            <ProjectError
                errors={mockErrors}
                onErrorClick={mockOnErrorClick}
                isOpen
                onToggle={mockOnToggle}
            />
        );

        // expand section first
        fireEvent.click(screen.getByText('Financials').closest('button')!);
        fireEvent.click(screen.getByText('What is the current revenue?'));

        expect(mockOnErrorClick).toHaveBeenCalledWith(
            'Financials',
            'revenue-details',
            'revenue-1'
        );
        expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('applies correct styling to prevent background overflow', () => {
        const { container } = render(
            <ProjectError
                errors={mockErrors}
                onErrorClick={mockOnErrorClick}
                isOpen
                onToggle={mockOnToggle}
            />
        );

        expect(container.querySelector('.overflow-hidden')).toBeInTheDocument();
        expect(container.querySelector('.rounded-tl-lg')).toBeInTheDocument();
    });
});
