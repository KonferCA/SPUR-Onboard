import { forwardRef } from 'react';
import { Field, Label, Input, Description } from '@headlessui/react';
import {
    getDescriptionStyles,
    getInputStyles,
    getPrefixStyles,
} from './TextInput.styles';

export interface TextInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    description?: string;
    value?: string;
    required?: boolean;
    prefix?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    rows?: number;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    (
        {
            label,
            error,
            description,
            prefix,
            className = '',
            value,
            required,
            disabled,
            onChange,
            rows = 4,
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
                    <div className="flex">
                        {prefix && (
                            <div className={getPrefixStyles()}>{prefix}</div>
                        )}
                        <Input
                            ref={ref as any}
                            className={getInputStyles({
                                className,
                                prefix: !!prefix,
                                error: !!error,
                                disabled: !!disabled,
                            })}
                            invalid={!!error}
                            required={required}
                            disabled={disabled}
                            {...inputProps}
                            {...props}
                        />
                    </div>
                    {(description || error) && (
                        <Description
                            className={getDescriptionStyles({ error: !!error })}
                        >
                            {error || description}
                        </Description>
                    )}
                </Field>
            </div>
        );
    }
);

TextInput.displayName = 'TextInput';

export { TextInput };