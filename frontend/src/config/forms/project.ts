import { createUploadableFile, UploadableFile } from '@/components';
import { ProjectQuestionsData } from '@/services/project';
import { FormField, FormFieldType } from '@/types';
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

    return questions.reduce<GroupedProjectQuestions[]>(
        (acc, projectQuestion) => {
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

            const inputField: FormField = {
                key: projectQuestion.inputTypeId,
                type: projectQuestion.inputType as FormFieldType,
                label: projectQuestion.question,
                required: projectQuestion.required,
                options: projectQuestion.options?.map((opt, idx) => ({
                    id: idx,
                    label: opt,
                    value: opt,
                })),
                validations: projectQuestion.validations
                    ? createZodSchema(projectQuestion.validations)
                    : undefined,
                value: {},
            };

            switch (inputField.type) {
                case 'file':
                    inputField.value.files =
                        documentsByQuestion[projectQuestion.id] ?? [];
                    break;
                case 'team':
                    inputField.value.teamMembers = teamMembers ?? [];
                    break;
                default:
                    inputField.value.value = projectQuestion.answer;
                    break;
            }

            let question = subSection.questions.find(
                (q) => q.id === projectQuestion.id
            );
            if (!question) {
                question = {
                    id: projectQuestion.id,
                    question: projectQuestion.question,
                    required: projectQuestion.required,
                    inputFields: [inputField],
                };
                subSection.questions.push(question);
            } else {
                question.inputFields.push(inputField);
            }

            return acc;
        },
        []
    );
}
