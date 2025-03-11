import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AutoSaveIndicator } from '@/components/AutoSaveIndicator';

describe('AutoSaveIndicator', () => {
    const defaultMessages = {
        idle: 'Your answers will be autosaved as you complete your application',
        saving: 'Autosaving...',
        success: 'All changes saved',
        error: 'Failed to save changes',
    };

    const mobileMessages = {
        idle: 'Answers are autosaved',
        saving: 'Autosaving...',
        success: 'All changes saved',
        error: 'Failed to save changes',
    };

    const desktopTestId = 'desktop-autosaveindicator-text';
    const mobileTestId = 'mobile-autosaveindicator-text';

    it('should render with default messages for each status', () => {
        const statuses: ('idle' | 'saving' | 'success' | 'error')[] = [
            'idle',
            'saving',
            'success',
            'error',
        ];

        statuses.forEach((status) => {
            const { rerender } = render(<AutoSaveIndicator status={status} />);
            const desktopText = screen.getByTestId(desktopTestId);
            expect(desktopText).toBeVisible();
            expect(desktopText.textContent).toBe(defaultMessages[status]);
            const mobileText = screen.getByTestId(mobileTestId);
            expect(mobileText.textContent).toBe(mobileMessages[status]);
            rerender(<div />);
        });
    });

    it('should render custom messages when provided', () => {
        const customMessage = 'Custom status message';
        render(<AutoSaveIndicator status="idle" message={customMessage} />);
        // Both desktop/mobile should render the same message
        const desktopText = screen.getByTestId(desktopTestId);
        const mobileText = screen.getByTestId(mobileTestId);
        expect(desktopText.textContent).toBe(customMessage);
        expect(mobileText.textContent).toBe(customMessage);
    });

    it('should render loading spinner when saving', () => {
        render(<AutoSaveIndicator status="saving" />);
        expect(document.querySelector('.animate-spin')).toBeVisible();
    });

    it('should apply custom className when provided', () => {
        const customClass = 'custom-test-class';
        render(<AutoSaveIndicator status="idle" className={customClass} />);
        expect(document.querySelector(`.${customClass}`)).toBeVisible();
    });
});

