import React from 'react';
import { NotificationBanner } from '@/components';

interface SettingsPageProps {
    title: string;
    children: React.ReactNode;
    error?: string | null;
    action?: React.ReactNode;
}

export function SettingsPage({ title, children, error, action }: SettingsPageProps) {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">{title}</h1>
                {action}
            </div>
            {error && (
                <div className="mb-6">
                    <NotificationBanner message={error} variant="error" />
                </div>
            )}
            {children}
        </div>
    );
} 