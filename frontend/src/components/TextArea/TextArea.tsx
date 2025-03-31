import { forwardRef } from 'react';
import { Field, Label, Textarea } from '@headlessui/react';
import { cva } from 'class-variance-authority';

const inputStyles = cva(
    [
        'w-full px-4 py-2',
        'bg-white ',
        'border border-gray-300 ',
        'rounded-md',
        'focus:outline-none focus:ring-2 focus:ring-blue-500',
        'data-[invalid]:border-red-500',
        'min-h-[100px] resize-y',
    ],
    {
        variants: {
            disabled: {
                true: ['bg-gray-100', 'text-gray-400', 'cursor-not-allowed'],
            },
        },
    }
);

export interface TextAreaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    description?: string;
    value?: string;
    required?: boolean;
    disabled?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    (
        {
            label,
            error,
            description,
            className = '',
            value,
            required,
            onChange,
            disabled,
            ...props
        },
        ref
    ) => {
        const inputProps = onChange
            ? { value, onChange }
            : { defaultValue: value };

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

                    <Textarea
                        ref={ref}
                        className={inputStyles({ className, disabled })}
                        invalid={!!error}
                        required={required}
                        disabled={disabled}
                        {...inputProps}
                        {...props}
                    />

                    {description && (
                        <div className="mt-1 text-sm text-gray-500">
                            {description}
                        </div>
                    )}

                    {error && (
                        <div className="mt-1 text-sm text-red-500">{error}</div>
                    )}
                </Field>
            </div>
        );
    }
);

TextArea.displayName = 'TextArea';
export { TextArea };
