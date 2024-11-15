import { forwardRef } from 'react';
import { Button as HeadlessButton } from '@headlessui/react';

// define size variants
const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
} as const;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    size?: keyof typeof sizeClasses;
    liquid?: boolean;
    variant?: 'primary' | 'secondary' | 'outline';
    isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ 
        children, 
        className = '', 
        size = 'md', 
        liquid = false,
        variant = 'primary',
        isLoading = false,
        disabled,
        ...props 
    }, ref) => {
        // base styles that are always applied
        const baseStyles = 'rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed m-2';
        
        // variant styles
        const variantStyles = {
            primary: 'bg-gray-700 text-white hover:bg-gray-800 focus:ring-gray-500',
            secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400',
            outline: 'border-2 border-gray-700 text-gray-700 hover:bg-gray-50 focus:ring-gray-400'
        };

        // combine all styles
        const buttonClasses = `
            ${baseStyles}
            ${sizeClasses[size]}
            ${variantStyles[variant]}
            ${liquid ? 'w-full' : ''}
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
                    <div className="flex items-center justify-center">
                        <svg 
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" 
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
                        Loading...
                    </div>
                ) : children}
            </HeadlessButton>
        );
    }
);

Button.displayName = 'Button';

export { Button }; 