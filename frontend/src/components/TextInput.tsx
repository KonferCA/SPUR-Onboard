import { forwardRef } from 'react';
import { Field, Label, Input } from '@headlessui/react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    description?: string;
    value?: string;
    required?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    multiline?: boolean;
    rows?: number;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    ({ label, error, description, className = '', value, required, onChange, multiline = false, rows = 4, ...props }, ref) => {
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

        const InputComponent = multiline ? 'textarea' : 'input';

        return (
            <div className="w-full">
                <Field>
                    {label && (
                        <div className="flex justify-between items-center mb-1">
                            <Label className="block text-md font-normal">
                                {label}
                            </Label>
                            {required && (
                                <span className="text-sm text-gray-500">
                                    Required
                                </span>
                            )}
                        </div>
                    )}
                    
                    <InputComponent
                        ref={ref as any}
                        className={sharedClassNames}
                        invalid={!!error}
                        required={required}
                        rows={multiline ? rows : undefined}
                        {...inputProps}
                        {...props}
                    />
                </Field>
                {error && (
                    <p className="mt-1 text-sm text-red-500">
                        {error}
                    </p>
                )}
                {description && (
                    <p className="mt-1 text-sm text-gray-500">
                        {description}
                    </p>
                )}
            </div>
        );
    }
);

TextInput.displayName = 'TextInput';
export { TextInput };
