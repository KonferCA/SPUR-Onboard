import {
    TextInput,
    TextArea,
    FileUpload,
    Dropdown,
    TeamMembers,
    DateInput,
} from '@/components';
import { Question } from '@/config/forms';
import { FormField } from '@/types';
import { FC, useRef, useEffect } from 'react';
import { cva } from 'class-variance-authority';

const legendStyles = cva('block text-md font-normal', {
    variants: {
        hasError: {
            true: 'text-red-600',
            false: 'text-gray-900',
        },
    },
    defaultVariants: {
        hasError: false,
    },
});

const requiredIndicatorStyles = cva('ml-1', {
    variants: {
        hasError: {
            true: 'text-red-500',
            false: 'text-gray-500',
        },
    },
    defaultVariants: {
        hasError: false,
    },
});

const requiredTextStyles = cva('text-sm', {
    variants: {
        hasError: {
            true: 'text-red-500',
            false: 'text-gray-500',
        },
    },
    defaultVariants: {
        hasError: false,
    },
});

const fieldsetStyles = cva('space-y-4 rounded-lg p-3 mb-2', {
    variants: {
        highlight: {
            true: 'animate-blink',
            false: '',
        },
    },
    defaultVariants: {
        highlight: false,
    },
});

const headerContainerStyles = cva('flex justify-between items-center mb-1');

interface QuestionInputsProps {
    question: Question;
    onChange: (questionID: string, inputTypeID: string, value: any) => void;
    className?: string;
    fileUploadProps?: {
        projectId?: string;
        questionId?: string;
        section?: string;
        subSection?: string;
        accessToken?: string;
        enableAutosave?: boolean;
    };
    shouldHighlight?: boolean;
}

export const QuestionInputs: FC<QuestionInputsProps> = ({
    question,
    onChange,
    fileUploadProps,
    shouldHighlight = false,
}) => {
    const hasInvalidField = question.inputFields.some((field) => field.invalid);
    const isQuestionRequired = question.inputFields.some(
        (field) => field.required
    );
    
    // reference to the first input field
    const inputRef = useRef<HTMLInputElement | null>(null);
    
    // auto-focus when highlighted
    useEffect(() => {
        if (shouldHighlight && inputRef.current) {
            // slight delay to ensure focus happens after scroll and DOM is ready
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 300);
            
            return () => clearTimeout(timer);
        }
    }, [shouldHighlight]);

    const getErrorMessage = (field: FormField): string => {
        if (!field.invalid) return '';

        if (!field.value.value) {
            switch (field.type) {
                case 'textinput':
                    return 'Please enter a value';
                case 'textarea':
                    return 'Please provide a description';
                case 'multiselect':
                    return 'Please select at least one option';
                case 'select':
                    return 'Please select an option';
                case 'date':
                    return 'Please select a date';
                default:
                    return 'This field is required';
            }
        }

        if (field.validations) {
            switch (field.type) {
                case 'textinput':
                    return 'Please enter a valid value';
                case 'textarea':
                    return 'The text provided is not valid';
                case 'multiselect':
                case 'select':
                    return 'One or more selected options are not valid';
                case 'date':
                    return 'Please select a valid date';
                default:
                    return 'The provided value is not valid';
            }
        }

        return 'This field is required';
    };

    const renderInput = (field: FormField, isFirstInput = false) => {
        const errorMessage = getErrorMessage(field);
        
        // ref for the first input field
        const ref = isFirstInput ? inputRef : undefined;

        switch (field.type) {
            case 'textinput':
                return (
                    <TextInput
                        placeholder={field.placeholder}
                        value={field.value.value || ''}
                        onChange={(e) =>
                            onChange(question.id, field.key, e.target.value)
                        }
                        error={errorMessage}
                        required={field.required}
                        disabled={field.disabled}
                        ref={ref}
                        {...field.props}
                    />
                );

            case 'textarea':
                return (
                    <TextArea
                        placeholder={field.placeholder}
                        value={field.value.value || ''}
                        onChange={(e) =>
                            onChange(question.id, field.key, e.target.value)
                        }
                        required={field.required}
                        rows={field.rows || 4}
                        error={errorMessage}
                        disabled={field.disabled}
                        ref={ref}
                        {...field.props}
                    />
                );

            case 'file':
                return (
                    <FileUpload
                        onFilesChange={(v) => onChange(field.key, field.key, v)}
                        initialFiles={field.value.files || []}
                        {...(fileUploadProps && {
                            ...fileUploadProps,
                            questionId: field.key,
                        })}
                        {...field.props}
                    />
                );

            case 'multiselect':
            case 'select':
                const selectedOption =
                    field.type === 'multiselect'
                        ? field.value.value
                        : field.options?.find(
                              (opt) => opt.value === field.value.value[0]?.value
                          ) || {
                              id: -1,
                              label: '',
                              value: '',
                          };

                return (
                    <Dropdown
                        options={field.options ?? []}
                        value={selectedOption}
                        onChange={(selected) =>
                            onChange(
                                question.id,
                                field.key,
                                Array.isArray(selected) ? selected : [selected]
                            )
                        }
                        multiple={field.type === 'multiselect'}
                        error={errorMessage}
                        {...field.props}
                    />
                );

            case 'team':
                return (
                    <TeamMembers
                        initialValue={field.value.teamMembers || []}
                        {...field.props}
                    />
                );

            case 'date':
                return (
                    <DateInput
                        value={field.value.value}
                        onChange={(v) => onChange(question.id, field.key, v)}
                        disabled={field.disabled}
                        error={errorMessage}
                        {...field.props}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <fieldset id={question.id} className={fieldsetStyles({ highlight: shouldHighlight })}>
            <div className={headerContainerStyles()}>
                <legend className={legendStyles({ hasError: hasInvalidField })}>
                    {question.question}
                    {isQuestionRequired && (
                        <span
                            className={requiredIndicatorStyles({
                                hasError: hasInvalidField,
                            })}
                        >
                            *
                        </span>
                    )}
                </legend>
                {isQuestionRequired && (
                    <span
                        className={requiredTextStyles({
                            hasError: hasInvalidField,
                        })}
                    >
                        Required
                    </span>
                )}
            </div>
            <div className="space-y-4">
                {question.inputFields.map((field, index) => (
                    <div key={field.key} className="w-full">
                        {renderInput(field, index === 0)}
                    </div>
                ))}
            </div>
        </fieldset>
    );
};
