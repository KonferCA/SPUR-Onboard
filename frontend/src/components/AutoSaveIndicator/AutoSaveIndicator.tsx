import type React from 'react';
import { useEffect, useState } from 'react';
import { cva } from 'class-variance-authority';

const indicatorStyles = cva(
    'w-full transition-all duration-300 flex items-center justify-center py-1 text-sm font-medium border-b',
    {
        variants: {
            status: {
                idle: 'bg-gray-50 text-gray-600 border-gray-200',
                saving: 'bg-blue-50 text-blue-700 border-blue-100',
                success: 'bg-green-50 text-green-700 border-green-100',
                error: 'bg-red-50 text-red-700 border-red-100',
            },
        },
        defaultVariants: {
            status: 'idle',
        },
    }
);

export interface AutoSaveIndicatorProps {
    status: 'idle' | 'saving' | 'success' | 'error';
    message?: string;
    className?: string;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
    status,
    message,
    className = '',
}) => {
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (status === 'success') {
            setShowSuccess(true);
            timeout = setTimeout(() => {
                setShowSuccess(false);
            }, 2000);
        }
        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [status]);

    const indicatorStatus =
        status === 'saving'
            ? 'saving'
            : status === 'error'
                ? 'error'
                : showSuccess
                    ? 'success'
                    : 'idle';

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

    const displayMessage = message || defaultMessages[indicatorStatus];
    const mobileDisplayMessage = message || mobileMessages[indicatorStatus];

    return (
        <div
            className={indicatorStyles({ status: indicatorStatus, className })}
        >
            <div className="flex px-6 lg:px-0 justify-center items-center gap-2">
                {status === 'saving' && (
                    <div className="w-4 h-4 relative">
                        <div className="absolute inset-0 border-2 border-blue-700 border-solid rounded-full border-r-transparent animate-spin" />
                    </div>
                )}
                <span
                    data-testid="desktop-autosaveindicator-text"
                    className="hidden md:inline text-sm sm:text-base"
                >
                    {displayMessage}
                </span>
                <span
                    data-testid="mobile-autosaveindicator-text"
                    className="inline md:hidden text-sm sm:text-base"
                >
                    {mobileDisplayMessage}
                </span>
            </div>
        </div>
    );
};
