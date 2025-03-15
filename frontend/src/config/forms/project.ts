import { createUploadableFile, type UploadableFile } from '@/components';
import type {
    ConditionType,
    ProjectQuestion,
    ProjectQuestionsData,
} from '@/services/project';
import type { FormField, FormFieldType } from '@/types';
import { createZodSchema } from '@/utils/form-validation';

export interface GroupedProjectQuestions {
    // section basically serves as the id of the group
    section: string;
    subSections: SubSection[];
    subSectionNames: string[];
}

export interface SubSection {
    name: string;
    questions: Question[];
}

export interface Question {
    id: string;
    question: string;
    required: boolean;
    inputFields: FormField[];
    dependentQuestionId?: string;
    conditionType?: ConditionType;
    conditionValue?: string;
    questionGroupId?: string;
    questionOrder: number;
    description?: string;
    answer?: string;
}

export interface SectionMetadata {
    name: string;
    subSections: string[];
}

/*
 * This will sort based on the sections order array and group the questions that belong
 * to the same section together. The questions in a section will also be sorted based on their
 * sub section order.
 */
export function groupProjectQuestions(
    data: ProjectQuestionsData
): GroupedProjectQuestions[] {
    const { questions, documents, teamMembers } = data;

    // Pre-process documents for faster lookup
    const documentsByQuestion =
        documents?.reduce(
            (acc, doc) => {
                if (!acc[doc.questionId]) {
                    acc[doc.questionId] = [];
                }
                const file = new File([new ArrayBuffer(doc.size)], doc.name, {
                    type: doc.mimeType,
                });
                acc[doc.questionId].push(createUploadableFile(file, doc, true));
                return acc;
            },
            {} as Record<string, UploadableFile[]>
        ) ?? {};

    // Group questions by questionGroupId
    const questionGroups = questions.reduce(
        (acc, q) => {
            const groupId = q.questionGroupId || q.id;
            if (!acc[groupId]) {
                acc[groupId] = [];
            }
            acc[groupId].push(q);
            return acc;
        },
        {} as Record<string, ProjectQuestion[]>
    );

    return questions.reduce<GroupedProjectQuestions[]>(
        (acc, projectQuestion) => {
            // Skip if this question is part of a group but not the primary question
            if (projectQuestion.questionGroupId) {
                return acc;
            }

            let group = acc.find((g) => g.section === projectQuestion.section);
            if (!group) {
                group = {
                    section: projectQuestion.section,
                    subSections: [],
                    subSectionNames: [],
                };
                acc.push(group);
            }

            let subSection = group.subSections.find(
                (s) => s.name === projectQuestion.subSection
            );
            if (!subSection) {
                subSection = {
                    name: projectQuestion.subSection,
                    questions: [],
                };
                group.subSections.push(subSection);
                group.subSectionNames.push(projectQuestion.subSection);
            }

            // Get all questions in this group
            const groupQuestions = questionGroups[projectQuestion.id] || [
                projectQuestion,
            ];

            const inputFields = groupQuestions.map((q) => {
                const inputField: FormField = {
                    key: q.id,
                    type: q.inputType as FormFieldType,
                    label: q.question,
                    required: q.required,
                    placeholder: q.placeholder || undefined,
                    description: q.description || undefined,
                    validations: q.validations
                        ? createZodSchema(
                              q.inputType as FormFieldType,
                              q.validations
                          )
                        : undefined,
                    value: {},
                    disabled: q.disabled,
                };

                if (typeof q.inputProps === 'string') {
                    const decoded = window.atob(q.inputProps);
                    try {
                        inputField.props = JSON.parse(decoded);
                    } catch (err) {
                        console.error(err);
                    }
                }

                switch (inputField.type) {
                    case 'file':
                        inputField.value.files =
                            documentsByQuestion[q.id] ?? [];
                        break;
                    case 'team':
                        inputField.value.teamMembers = teamMembers ?? [];
                        break;
                    case 'fundingstructure':
                        try {
                            if (q.answer) {
                                inputField.value.fundingStructure = JSON.parse(
                                    q.answer
                                );
                            }
                        } catch (err) {
                            console.error(
                                'Failed to parse funding structure:',
                                err
                            );
                        }
                        break;
                    case 'multiselect':
                    case 'select':
                        inputField.options = q.options?.map((opt, idx) => ({
                            id: idx,
                            label: opt,
                            value: opt,
                        }));
                        inputField.value.value = q.choices.map((c, idx) => ({
                            id: idx,
                            label: c,
                            value: c,
                        }));
                        break;
                    case 'date': {
                        const date = new Date(q.answer);
                        inputField.value.value = date;
                        break;
                    }
                    default:
                        inputField.value.value = q.answer;
                        break;
                }

                return inputField;
            });

            const question: Question = {
                id: projectQuestion.id,
                question: projectQuestion.question,
                required: projectQuestion.required,
                inputFields,
                dependentQuestionId:
                    projectQuestion.dependentQuestionId || undefined,
                conditionType: projectQuestion.conditionType || undefined,
                conditionValue: projectQuestion.conditionValue || undefined,
                questionOrder: projectQuestion.questionOrder,
                description: projectQuestion.description || undefined,
                answer: projectQuestion.answer,
            };

            subSection.questions.push(question);

            return acc;
        },
        []
    );
}
