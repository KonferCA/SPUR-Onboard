import { forwardRef } from 'react';
import { Field, Label, Input } from '@headlessui/react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    description?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    multiline?: boolean;
    rows?: number;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    ({ label, error, description, className = '', value, onChange, multiline = false, rows = 4, ...props }, ref) => {
        const inputProps = onChange
            ? { value, onChange }
            : { defaultValue: value };

        const InputComponent = multiline ? 'textarea' : 'input';

        return (
            <div className="w-full">
                <Field>
                    {label && (
                        <Label className="block text-sm font-medium text-gray-900 mb-2">
                            {label}
                        </Label>
                    )}
                    <InputComponent
                        ref={ref as any}
                        className={`
                            w-full py-2 px-3
                            bg-white 
                            border border-gray-300 
                            rounded-md
                            focus:outline-none focus:ring-2 focus:ring-blue-500
                            data-[invalid]:border-red-500
                            ${className}
                        `}
                        rows={multiline ? rows : undefined}
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