import {
    CommentBubble,
    DropdownOption,
    FileDownload,
    TeamMembers,
} from '@/components';
import { BiSolidCommentAdd } from 'react-icons/bi';
import { Question } from '@/config/forms';
import { Comment } from '@/services/comment';
import { FormField } from '@/types';
import { FC, useState } from 'react';
import { CommentCreate } from '../CommentCreate';

interface ReviewQuestionsProps {
    question: Question;
    comments: Comment[];
    onCreateComment: (comment: string, targetId: string) => void;
    disableCommentCreation?: boolean;
}

export const ReviewQuestions: FC<ReviewQuestionsProps> = ({
    question,
    comments,
    onCreateComment,
    disableCommentCreation,
}) => {
    return question.inputFields.map((field) => {
        return (
            <ReviewQuestionInput
                disableCommentCreation={disableCommentCreation}
                key={field.key}
                field={field}
                comments={comments}
                onCreateComment={onCreateComment}
            />
        );
    });
};

interface ReviewQuestionInputProps {
    field: FormField;
    comments: Comment[];
    onCreateComment: (comment: string, targetId: string) => void;
    disableCommentCreation?: boolean;
}

const ReviewQuestionInput: FC<ReviewQuestionInputProps> = ({
    field,
    comments,
    onCreateComment,
    disableCommentCreation,
}) => {
    const [showCreateComment, setShowCreateComment] = useState(false);
    const renderInput = (field: FormField) => {
        switch (field.type) {
            case 'textarea':
            case 'textinput':
                return field.value.value;
            case 'date':
                const date = field.value.value as Date;
                return date.toISOString().split('T')[0];
            case 'multiselect':
            case 'select':
                if (Array.isArray(field.value.value)) {
                    const value = field.value.value as DropdownOption[];
                    return value.map((v) => v.value).join(', ');
                } else if (
                    field.value.value !== null &&
                    field.value.value !== undefined
                ) {
                    switch (typeof field.value.value) {
                        case 'object':
                            const value = field.value.value as DropdownOption;
                            return value.value;
                        case 'string':
                            return field.value.value;
                        default:
                            break;
                    }
                }
                return null;

            case 'file':
                if (Array.isArray(field.value.files)) {
                    return (
                        <FileDownload
                            docs={field.value.files
                                .map((f) => f.metadata)
                                .filter((f) => f !== undefined)}
                        />
                    );
                }
                break;

            case 'team':
                return (
                    <TeamMembers
                        initialValue={field.value.teamMembers || []}
                        disabled
                    />
                );

            default:
                return null;
        }
    };
    return (
        <div className="relative">
            <div className="group p-2 rounded-lg border border-gray-300 bg-white relative">
                <div className="flex justify-between items-center mb-1">
                    <span className="block text-md font-normal text-gray-500">
                        {field.label}
                    </span>
                </div>
                <div className="space-y-4">{renderInput(field)}</div>
                {!disableCommentCreation && (
                    <button
                        type="button"
                        onClick={() => {
                            setShowCreateComment(true);
                        }}
                        className="absolute top-0 right-0 -translate-y-1/2 -translate-x-1/2 bg-gray-100 border-gray-300 border  rounded-lg p-2 invisible group-hover:visible"
                    >
                        <BiSolidCommentAdd className="h-6 w-6" />
                    </button>
                )}
                {showCreateComment && (
                    <CommentCreate
                        className="absolute top-0 right-0 z-50"
                        onSubmit={(comment) => {
                            onCreateComment(comment, field.key);
                            setShowCreateComment(false);
                        }}
                        onCancel={() => setShowCreateComment(false)}
                    />
                )}
            </div>
            <div className="absolute -right-2 top-0 -translate-y-1/2 translate-x-full flex items-center gap-3">
                {comments
                    .filter((c) => c.targetId === field.key)
                    .map((c) => (
                        <div key={c.id}>
                            <CommentBubble data={c} />
                        </div>
                    ))}
            </div>
        </div>
    );
};
