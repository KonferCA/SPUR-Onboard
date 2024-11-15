import { forwardRef } from 'react';
import { Field, Label, Input } from '@headlessui/react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    description?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    ({ label, error, description, className = '', value, onChange, ...props }, ref) => {
        const inputProps = onChange
            ? { value, onChange }
            : { defaultValue: value };

        return (
            <div className="max-w-[400px] w-full">
                <Field>
                    {label && (
                        <Label className="block text-2xl font-bold">
                            {label}
                        </Label>
                    )}
                    <Input
                        ref={ref}
                        className={`
                            w-full py-3 px-4 
                            bg-white 
                            border border-gray-300 
                            rounded-md
                            focus:outline-none focus:ring-2 focus:ring-blue-500
                            data-[invalid]:border-red-500
                            ${className}
                        `}
                        invalid={!!error}
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