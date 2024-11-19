import { forwardRef } from 'react';
import { Field, Label, Input } from '@headlessui/react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    description?: string;
    value?: string;
    required?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    ({ label, error, description, className = '', value, required, onChange, ...props }, ref) => {
        const inputProps = onChange
            ? { value, onChange }
            : { defaultValue: value };
        
        const sharedClassNames = `
            w-full px-4 py-3
            bg-white 
            border border-gray-300 
            rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500
            data-[invalid]:border-red-500
            ${className}
        `;

        return (
            <div className="w-full">
                <Field>
                    {label && (
                        <div className="flex justify-between items-center mb-1">
                            <Label className="block text-md font-bold">
                                {label}
                            </Label>
                            {required && (
                                <span className="text-sm text-gray-500">
                                    Required
                                </span>
                            )}
                        </div>
                    )}
                    
                    <Input
                        ref={ref}
                        className={sharedClassNames}
                        invalid={!!error}
                        required={required}
                        {...inputProps}
                        {...props}
                    />

                    {description && (
                        <div className="mt-1 text-sm text-gray-500">
                            {description}
                        </div>
                    )}

                    {error && (
                        <div className="mt-1 text-sm text-red-500">
                            {error}
                        </div>
                    )}
                </Field>
            </div>
        );
    }
);

TextInput.displayName = 'TextInput';
export { TextInput };
