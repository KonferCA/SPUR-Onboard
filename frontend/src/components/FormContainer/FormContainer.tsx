import React from 'react';
import type { ComponentProps } from '@/types/common';

export interface FormContainerProps extends ComponentProps {
    title: string;
}

const FormContainer: React.FC<FormContainerProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col items-center px-4">
            <div className="w-full max-w-xl p-8">{children}</div>
        </div>
    );
};

export { FormContainer };
