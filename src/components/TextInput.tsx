import { forwardRef } from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="w-[400px]">
                {label && (
                    <label className="block text-2xl font-bold mb-2">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`
                        w-full py-3 px-4 
                        bg-white 
                        border border-gray-300 
                        rounded-md
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                        ${error ? 'border-red-500' : ''}
                        ${className}
                    `}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                )}
            </div>
        );
    }
);

TextInput.displayName = 'TextInput';

export { TextInput }; 