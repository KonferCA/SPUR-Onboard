import React from 'react';
import { NotificationBanner } from '@/components';

interface SettingsPageProps {
    title: string;
    children: React.ReactNode;
    error?: string | null;
    action?: React.ReactNode;
    className?: string;
}

export function SettingsPage({ 
    title, 
    children, 
    error, 
    action,
    className = ''
}: SettingsPageProps) {
    return (
        <div className={`w-full max-w-4xl mx-auto px-4 sm:px-6 py-0 ${className}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                <h1 className="text-3xl font-bold mb-3 sm:mb-0">
                    {title.split(' ').map((word, i) => (
                        <span key={i} className={i === 0 ? 'text-button-primary-100' : ''}>
                            {' '}{word}
                        </span>
                    ))}
                </h1>
                
                {action && (
                    <div className="mb-3 sm:mb-0">
                        {action}
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-4 sm:mb-6">
                    <NotificationBanner message={error} variant="error" />
                </div>
            )}

            <div className="text-base">
                {children}
            </div>
        </div>
    );
}