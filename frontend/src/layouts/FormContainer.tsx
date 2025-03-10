import type { ReactNode } from 'react';

interface FormContainerProps {
    children: ReactNode;
    title?: string;
    description?: string;
    className?: string;
}

const FormContainer: React.FC<FormContainerProps> = ({
    children,
    title,
    description,
    className = '',
}) => {
    return (
        <div
            className={`bg-white rounded-lg border border-gray-200 ${className}`}
        >
            {(title || description) && (
                <div className="border-b border-gray-200 p-6">
                    {title && (
                        <h3 className="text-lg font-semibold">{title}</h3>
                    )}
                    {description && (
                        <p className="mt-1 text-sm text-gray-600">
                            {description}
                        </p>
                    )}
                </div>
            )}
            <div className="p-6">{children}</div>
        </div>
    );
};

export { FormContainer };
