import React, { useEffect, useState } from 'react';
import { cva } from 'class-variance-authority';

const indicatorStyles = cva(
    'fixed top-0 left-0 right-0 transition-all duration-300 flex items-center justify-center py-1 text-sm font-medium z-[100]',
    {
        variants: {
            status: {
                saving: 'bg-blue-50 text-blue-700',
                success: 'bg-green-50 text-green-700',
                error: 'bg-red-50 text-red-700',
                hidden: 'bg-transparent -translate-y-full'
            }
        },
        defaultVariants: {
            status: 'hidden'
        }
    }
);

export interface AutosaveIndicatorProps {
    status: 'idle' | 'saving' | 'success' | 'error';
    message?: string;
}

export const AutosaveIndicator: React.FC<AutosaveIndicatorProps> = ({ 
    status,
    message
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
        status === 'idle' ? 'hidden' :
        status === 'saving' ? 'saving' :
        status === 'error' ? 'error' :
        showSuccess ? 'success' : 'hidden';

    const defaultMessages = {
        saving: 'Autosaving...',
        success: 'All changes saved',
        error: 'Failed to save changes'
    };

    const displayMessage = message || defaultMessages[status as keyof typeof defaultMessages] || '';

    return (
        <div className={indicatorStyles({ status: indicatorStatus })}>
            <div className="flex items-center gap-2">
                {status === 'saving' && (
                    <div className="w-4 h-4 relative">
                        <div className="absolute inset-0 border-2 border-blue-700 border-solid rounded-full border-r-transparent animate-spin" />
                    </div>
                )}
                <span>{displayMessage}</span>
            </div>
        </div>
    );
};