import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AutoSaveIndicator } from '@/components/AutoSaveIndicator';

describe('AutoSaveIndicator', () => {
    const defaultMessages = {
        idle: 'Your answers will be autosaved as you complete your application',
        saving: 'Autosaving...',
        success: 'All changes saved',
        error: 'Failed to save changes'
    };

    it('should render with default messages for each status', () => {
        const statuses: ('idle' | 'saving' | 'success' | 'error')[] = ['idle', 'saving', 'success', 'error'];
        
        statuses.forEach(status => {
            const { rerender } = render(<AutoSaveIndicator status={status} />);
            expect(screen.getByText(defaultMessages[status])).toBeInTheDocument();
            rerender(<div />);
        });
    });

    it('should render custom messages when provided', () => {
        const customMessage = 'Custom status message';
        render(<AutoSaveIndicator status="idle" message={customMessage} />);
        expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('should render loading spinner when saving', () => {
        render(<AutoSaveIndicator status="saving" />);
        expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should apply custom className when provided', () => {
        const customClass = 'custom-test-class';
        render(<AutoSaveIndicator status="idle" className={customClass} />);
        expect(document.querySelector(`.${customClass}`)).toBeInTheDocument();
    });
});