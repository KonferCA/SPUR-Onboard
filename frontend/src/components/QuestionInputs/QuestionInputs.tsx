import {
    TextInput,
    TextArea,
    FileUpload,
    Dropdown,
    TeamMembers,
    DateInput,
    Comments,
} from '@/components';
import type { DropdownOption, UploadableFile } from '@/components';
import type { Question } from '@/config';
import type { FormField } from '@/types';
import { type FC, useRef, useEffect, useMemo, useState } from 'react';
import { cva } from 'class-variance-authority';
import FundingStructure, {
    type FundingStructureModel,
} from '../FundingStructure';
import type { Comment } from '@/services/comment';
import { ProjectStatusEnum } from '@/services/projects';

const legendStyles = cva('block text-lg font-normal', {
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
            error: 'animate-blink',
            neutral: 'animate-neutralBlink',
            false: '',
        },
    },
    defaultVariants: {
        highlight: false,
    },
});

const headerContainerStyles = cva('flex justify-between items-center mb-1');

const MOBILE_BREAKPOINT = 1375;

interface QuestionInputsProps {
    question: Question;
    onChange: (
        questionID: string,
        inputTypeID: string,
        value:
            | string
            | string[]
            | Date
            | DropdownOption
            | DropdownOption[]
            | UploadableFile[]
            | FundingStructureModel
    ) => void;
    className?: string;
    fileUploadProps?: {
        projectId?: string;
        questionId?: string;
        section?: string;
        subSection?: string;
        accessToken?: string;
        enableAutosave?: boolean;
    };
    shouldHighlight?: boolean | 'error' | 'neutral';
    comments?: Comment[];
    projectStatus?: string;
    allowEdit?: boolean;
}

const isFundingStructureField = (field: FormField) =>
    field.type === 'fundingstructure';

export const QuestionInputs: FC<QuestionInputsProps> = ({
    question,
    onChange,
    fileUploadProps,
    comments = [],
    shouldHighlight = false,
    projectStatus,
    allowEdit,
}) => {
    const hasInvalidField = question.inputFields.some((field) => field.invalid);
    const isQuestionRequired = question.inputFields.some(
        (field) => field.required
    );

    const isFundingStructureQuestion = question.inputFields.some(
        isFundingStructureField
    );

    // references to the first input fields of different types
    const textInputRef = useRef<HTMLInputElement | null>(null);
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

    // State to track mobile view
    const [isMobileView, setIsMobileView] = useState(false);

    // Effect to check screen size on mount and resize
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobileView(window.innerWidth < MOBILE_BREAKPOINT);
        };
        checkScreenSize(); // Initial check
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize); // Cleanup
    }, []);

    // Determine if this question should be enabled or disabled
    const shouldDisableInput = useMemo(() => {
        // Only apply special logic if project status is 'needs review' and allowEdit is true
        if (projectStatus !== ProjectStatusEnum.NeedsReview || !allowEdit) {
            return false;
        }

        // Check if the question has any comments that don't have resolvedBySnapshotId
        const questionComments = comments.filter(
            (comment) =>
                comment.targetId === question.id &&
                !comment.resolvedBySnapshotId
        );

        // If this question has comments without resolvedBySnapshotId, ENABLE it
        if (questionComments.length > 0) {
            return false;
        }

        // If this is a conditionally rendered input (has dependentQuestionId),
        // check if its dependent question has comments (and is therefore enabled)
        if (question.dependentQuestionId) {
            const dependentQuestionComments = comments.filter(
                (comment) =>
                    comment.targetId === question.dependentQuestionId &&
                    !comment.resolvedBySnapshotId
            );

            // If dependent question has comments, enable this question too
            if (dependentQuestionComments.length > 0) {
                return false;
            }
        }

        // By default, if no rule enables the input, disable it
        return true;
    }, [
        question.id,
        question.dependentQuestionId,
        comments,
        projectStatus,
        allowEdit,
    ]);

    // auto-focus when highlighted
    useEffect(() => {
        if (shouldHighlight) {
            // slight delay to ensure focus happens after scroll and DOM is ready
            const timer = setTimeout(() => {
                if (textInputRef.current) {
                    textInputRef.current.focus();
                } else if (textAreaRef.current) {
                    textAreaRef.current.focus();
                }
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
                case 'fundingstructure':
                    return 'Please choose your funding structure';
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

        // set appropriate ref for the first input field based on type
        const inputProps: Record<string, unknown> = {};
        if (isFirstInput) {
            if (field.type === 'textinput') {
                inputProps.ref = textInputRef;
            } else if (field.type === 'textarea') {
                inputProps.ref = textAreaRef;
            }
        }

        // Apply disabled state based on our conditions
        const isDisabled = shouldDisableInput || field.disabled;

        switch (field.type) {
            case 'textinput':
                return (
                    <TextInput
                        placeholder={field.placeholder}
                        value={(field.value.value as string) || ''}
                        onChange={(e) =>
                            onChange(question.id, field.key, e.target.value)
                        }
                        error={errorMessage}
                        required={field.required}
                        disabled={isDisabled}
                        {...inputProps}
                        {...field.props}
                    />
                );

            case 'textarea':
                return (
                    <TextArea
                        placeholder={field.placeholder}
                        value={(field.value.value as string) || ''}
                        onChange={(e) =>
                            onChange(question.id, field.key, e.target.value)
                        }
                        required={field.required}
                        rows={field.rows || 4}
                        error={errorMessage}
                        disabled={isDisabled}
                        {...inputProps}
                        {...field.props}
                    />
                );

            case 'file':
                return (
                    <FileUpload
                        onFilesChange={(v) => onChange(field.key, field.key, v)}
                        initialFiles={field.value.files || []}
                        disabled={isDisabled}
                        {...(fileUploadProps && {
                            ...fileUploadProps,
                            questionId: field.key,
                        })}
                        {...field.props}
                    />
                );

            case 'fundingstructure':
                return (
                    <div className="w-full">
                        <FundingStructure
                            value={field.value.fundingStructure}
                            onChange={(structure) => {
                                onChange(question.id, field.key, structure);

                                if (!field.value.value) {
                                    onChange(
                                        question.id,
                                        field.key,
                                        'completed'
                                    );
                                }
                            }}
                            disabled={isDisabled}
                        />
                    </div>
                );

            case 'multiselect':
            case 'select': {
                const selectedOption =
                    field.type === 'multiselect'
                        ? field.value.value
                        : field.options?.find(
                              (opt) =>
                                  opt.value ===
                                  ((field.value.value as DropdownOption[])[0]
                                      ?.value as string)
                          ) || {
                              id: -1,
                              label: '',
                              value: '',
                          };

                return (
                    <Dropdown
                        options={field.options ?? []}
                        value={selectedOption as DropdownOption}
                        onChange={(selected) =>
                            onChange(
                                question.id,
                                field.key,
                                Array.isArray(selected) ? selected : [selected]
                            )
                        }
                        multiple={field.type === 'multiselect'}
                        error={errorMessage}
                        disabled={isDisabled}
                        {...field.props}
                    />
                );
            }

            case 'team':
                return (
                    <TeamMembers
                        initialValue={field.value.teamMembers || []}
                        disabled={isDisabled}
                        {...field.props}
                    />
                );

            case 'date':
                return (
                    <DateInput
                        value={field.value.value as Date}
                        onChange={(v) => onChange(question.id, field.key, v)}
                        disabled={isDisabled}
                        error={errorMessage}
                        {...field.props}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div className="relative">
            <fieldset
                id={question.id}
                className={fieldsetStyles({
                    highlight: shouldHighlight
                        ? shouldHighlight === true
                            ? 'error'
                            : shouldHighlight
                        : false,
                })}
            >
                {/* Only show the standard question header if it's NOT a funding structure question */}
                {!isFundingStructureQuestion && (
                    <div className={headerContainerStyles()}>
                        <legend
                            className={legendStyles({
                                hasError: hasInvalidField,
                            })}
                        >
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
                )}
                <div className="space-y-4">
                    {question.inputFields.map((field, index) => (
                        <div key={field.key} className="w-full">
                            {renderInput(field, index === 0)}
                        </div>
                    ))}
                </div>
            </fieldset>
            <Comments
                comments={comments.filter((c) => c.targetId === question.id)}
                rootContainerClasses={
                    isMobileView
                        ? 'relative z-auto mt-2 w-full' // Below input on mobile (default z-index)
                        : 'absolute z-20 -right-2 top-0 -translate-y-1/2 translate-x-full' // Right side on desktop (below drawer)
                }
            />
        </div>
    );
};
