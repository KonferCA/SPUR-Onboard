import { forwardRef } from 'react';
import { Button as HeadlessButton } from '@headlessui/react';
import type { ReactNode } from '@tanstack/react-router';

// define size variants
const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm sm:px-4 sm:py-2',
    md: 'px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base',
    lg: 'px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg',
} as const;

// define icon size variants
const iconSizeClasses = {
    sm: 'h-4 w-4 sm:h-5 sm:w-5',
    md: 'h-5 w-5 sm:h-6 sm:w-6',
    lg: 'h-6 w-6 sm:h-7 sm:w-7',
} as const;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    size?: keyof typeof sizeClasses;
    liquid?: boolean;
    variant?: 'primary' | 'secondary' | 'outline';
    icon?: ReactNode;
    isLoading?: boolean;
    fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            className = '',
            size = 'md',
            liquid = false,
            variant = 'primary',
            icon,
            isLoading = false,
            disabled,
            fullWidth = false,
            ...props
        },
        ref
    ) => {
        // base styles that are always applied
        const baseStyles =
            'inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed gap-2';

        // variant styles
        const variantStyles = {
            primary:
                'bg-button-primary-100 text-white hover:bg-button-primary-200 focus:ring-gray-500',
            secondary:
                'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400',
            outline:
                'border-2 border-button-primary-100 text-button-primary-100 hover:bg-button-primary-25 focus:ring-button-primary-200',
        };

        // loading spinner size classes
        const spinnerSizeClasses = {
            sm: 'h-4 w-4',
            md: 'h-5 w-5',
            lg: 'h-6 w-6',
        };

        // combine all styles
        const buttonClasses = `
            ${baseStyles}
            ${sizeClasses[size]}
            ${variantStyles[variant]}
            ${liquid || fullWidth ? 'w-full' : ''}
            ${className}
        `;

        return (
            <HeadlessButton
                ref={ref}
                className={buttonClasses}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                        <svg
                            className={`animate-spin ${spinnerSizeClasses[size]} text-current`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>

                        <span className="sm:inline">Loading...</span>
                    </div>
                ) : (
                    <>
                        {icon && (
                            <span className={iconSizeClasses[size]}>
                                {icon}
                            </span>
                        )}

                        {children}
                    </>
                )}
            </HeadlessButton>
        );
    }
);

Button.displayName = 'Button';

export { Button };
