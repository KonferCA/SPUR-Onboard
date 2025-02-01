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
import { FC } from 'react';

interface QuestionInputsProps {
    question: Question;
    onChange: (questionID: string, inputTypeID: string, value: any) => void;
    className?: string;
}

export const QuestionInputs: FC<QuestionInputsProps> = ({
    question,
    onChange,
}) => {
    const renderInput = (field: FormField) => {
        switch (field.type) {
            case 'textinput':
                return (
                    <TextInput
                        placeholder={field.placeholder}
                        value={field.value.value || ''}
                        onChange={(e) =>
                            onChange(question.id, field.key, e.target.value)
                        }
                        error={
                            field.invalid
                                ? 'This input has invalid content'
                                : ''
                        }
                        required={field.required}
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
                        error={
                            field.invalid
                                ? 'This input has invalid content'
                                : ''
                        }
                    />
                );

            case 'file':
                return (
                    <FileUpload
                        onFilesChange={(v) =>
                            onChange(question.id, field.key, v)
                        }
                        initialFiles={field.value.files || []}
                    />
                );

            case 'multiselect':
            case 'select':
                const selectedOption = field.options?.find(
                    (opt) => opt.value === field.value.value[0]
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
                            onChange(question.id, field.key, [selected.value])
                        }
                    />
                );

            case 'team':
                return (
                    <TeamMembers initialValue={field.value.teamMembers || []} />
                );

            case 'date':
                return (
                    <DateInput
                        value={field.value.value}
                        onChange={(v) => onChange(question.id, field.key, v)}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <fieldset>
            <div className="flex justify-between items-center mb-1">
                <legend className="block text-md font-normal">
                    {question.question}
                </legend>
                {question.required && (
                    <span className="text-sm text-gray-500">Required</span>
                )}
            </div>
            <div className="space-y-4">
                {question.inputFields.map((field) => (
                    <div key={field.key} className="w-full">
                        {renderInput(field)}
                    </div>
                ))}
            </div>
        </fieldset>
    );
};
