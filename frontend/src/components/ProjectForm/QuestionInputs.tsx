import {
    TextInput,
    TextArea,
    FileUpload,
    Dropdown,
    TeamMembers,
} from '@/components';
import { Question } from '@/config/forms';
import { FormField } from '@/types';
import { FC } from 'react';

interface QuestionInputsProps {
    question: Question;
    onChange: (id: string, value: any) => void;
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
                        key={field.key}
                        placeholder={field.placeholder}
                        value={field.value || ''}
                        onChange={(e) => onChange(field.key, e.target.value)}
                        required={field.required}
                    />
                );

            case 'textarea':
                return (
                    <TextArea
                        key={field.key}
                        placeholder={field.placeholder}
                        value={field.value || ''}
                        onChange={(e) => onChange(field.key, e.target.value)}
                        required={field.required}
                        rows={field.rows || 4}
                    />
                );

            case 'file':
                return (
                    <FileUpload onFilesChange={(v) => onChange(field.key, v)} />
                );

            case 'select':
                return (
                    <Dropdown
                        key={field.key}
                        options={field.options ?? []}
                        value={{
                            id: field.key,
                            label: field.value,
                            value: field.value,
                        }}
                        onChange={(v) => onChange(field.key, v)}
                    />
                );

            case 'team':
                return (
                    <TeamMembers
                        value={[]}
                        onChange={(v) => onChange(field.key, v)}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <label className="block text-md font-normal">
                    {question.question}
                </label>
                {question.required && (
                    <span className="text-sm text-gray-500">Required</span>
                )}
            </div>
            <div className="space-y-4">
                {question.inputFields.map((field) => (
                    <div key={`${question.id}_${field.key}`} className="w-full">
                        {renderInput(field)}
                    </div>
                ))}
            </div>
        </div>
    );
};
